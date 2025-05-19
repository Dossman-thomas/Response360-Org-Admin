import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUploadService } from '../../services/imageUpload.service';
import { ViewChild, ElementRef } from '@angular/core';
import { OrganizationService } from '../../services/organization.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../shared/environments/environment';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.css'],
})
export class OrganizationDetailsComponent implements OnInit {
  organizationForm!: FormGroup;
  mode: 'create' | 'update' = 'create';

  org_created_at?: string;
  org_updated_at?: string;
  org_status?: string;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  previewUrl: string | null = null;
  selectedLogoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private imageUploadService: ImageUploadService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkMode();
  }

  // Initialize Reactive Form with validation
  initializeForm(): void {
    this.organizationForm = this.fb.group({
      admin_first_name: ['', Validators.required],
      admin_last_name: ['', Validators.required],
      admin_email: ['', [Validators.required, Validators.email]],
      admin_phone_number: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\+?1?\s?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/
          ),
        ],
      ],
      org_name: ['', Validators.required],
      org_email: ['', [Validators.required, Validators.email]],
      org_phone_number: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\+?1?\s?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/
          ),
        ],
      ],
      logo: [''],
      org_status: ['Enabled', Validators.required],
      org_type: ['', Validators.required],
      jurisdiction_size: ['Global', Validators.required],
      org_address: ['', Validators.required],
      org_website: [
        '',
        Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(\S*)?$/),
      ],
    });
  }

  // Determine mode (create or view)
  checkMode(): void {
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    const orgIdParam = this.route.snapshot.queryParamMap.get('orgId');

    if (modeParam === 'update' && orgIdParam) {
      this.mode = 'update';
      this.fetchOrganizationDetails(orgIdParam);
    } else {
      this.mode = 'create';
    }
  }

  // Fetch organization details for update mode
  fetchOrganizationDetails(orgId: string): void {
    this.organizationService.getOrganizationById(orgId).subscribe({
      next: (data) => {
        // Patch organization data
        this.organizationForm.patchValue({
          org_name: data.orgName,
          org_email: data.orgEmail,
          org_phone_number: data.orgPhone,
          org_type: data.orgType,
          jurisdiction_size: data.jurisdictionSize,
          org_address: data.registeredAddress,
          org_website: data.website,
          org_status: data.status ? 'Enabled' : 'Disabled',
          logo: data.logo ? `${environment.backendHost}${data.logo}` : '',
        });

        // Patch admin user data
        if (data.adminUser) {
          this.organizationForm.patchValue({
            admin_first_name: data.adminUser.firstName,
            admin_last_name: data.adminUser.lastName,
            admin_email: data.adminUser.userEmail,
            admin_phone_number: data.adminUser.userPhoneNumber,
          });
        }

        // Format date fields
        const formatOptions: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        };

        this.org_created_at = new Date(data.orgCreatedAt).toLocaleDateString(
          'en-GB',
          formatOptions
        );
        this.org_updated_at = new Date(data.orgUpdatedAt).toLocaleDateString(
          'en-GB',
          formatOptions
        );
        this.org_status = data.status ? 'Enabled' : 'Disabled';
      },
      error: (err) => {
        console.error('❌ Failed to fetch org details:', err);
        this.router.navigate(['/not-found']); // or `/not-found`, etc.
      },
    });
  }

  // Get error message for form controls
  getErrorMessage(controlName: string): string {
    const control = this.organizationForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required.';
    if (control?.hasError('email')) return 'Please enter a valid email.';
    if (control?.hasError('pattern')) return 'Invalid format.';
    return '';
  }

  // Submit form data
  onSubmit(): void {
    // Mark all controls as touched to trigger validation messages
    Object.values(this.organizationForm.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity(); // Ensure validation runs
    });

    // Now check if the form is still invalid
    if (this.organizationForm.invalid) {
      console.log('Form is invalid');
      return; // Stop submission if invalid
    }

    const formValues = this.organizationForm.value;
    const orgId = this.route.snapshot.queryParamMap.get('orgId');
    const relativeLogoPath = formValues.logo
      ?.replace(environment.backendHost, '')
      .trim();

    // console.log('Form values:', formValues);
    // console.log('Relative logo path:', relativeLogoPath);

    if (this.mode === 'update' && orgId) {
      this.organizationService
        .updateOrganization(
          orgId,
          formValues.org_name,
          formValues.org_email,
          formValues.org_phone_number,
          formValues.org_address,
          formValues.org_type,
          formValues.jurisdiction_size,
          formValues.org_website,
          formValues.org_status,
          relativeLogoPath
        )
        .subscribe({
          next: (response) => {
            console.log('Organization updated successfully:', response);
            this.router.navigate(['/manage-organizations']);
          },
          error: (err) => {
            console.error('Failed to update organization:', err);

            if (err?.error?.field === 'orgEmail' && err?.error?.message) {
              this.organizationForm
                .get('org_email')
                ?.setErrors({ custom: err.error.message });
            }
          },
        });
    } else {
      this.organizationService
        .createOrganization(
          formValues.org_name,
          formValues.org_email,
          formValues.org_phone_number,
          formValues.org_address,
          formValues.org_type,
          formValues.jurisdiction_size,
          formValues.org_website,
          formValues.admin_first_name,
          formValues.admin_last_name,
          formValues.admin_email,
          formValues.admin_phone_number,
          formValues.logo
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/manage-organizations']);
          },
          error: (err) => {
            console.error('Failed to create organization:', err);

            const errorMessages: { [key: string]: string } = {};

            // Accumulate all errors
            if (err?.error?.orgEmail) {
              errorMessages['org_email'] = err.error.orgEmail;
            }
            if (err?.error?.adminEmail) {
              errorMessages['admin_email'] = err.error.adminEmail;
            }

            // Set all errors at once
            Object.keys(errorMessages).forEach((field) => {
              this.organizationForm
                .get(field)
                ?.setErrors({ custom: errorMessages[field] });
            });
          },
        });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedLogoFile = input.files[0];

      // Update preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedLogoFile);

      // Upload immediately to server
      const formData = new FormData();
      formData.append('logo', this.selectedLogoFile);

      this.imageUploadService.uploadLogo(formData).subscribe({
        next: (response) => {
          console.log('Image uploaded:', response);
          this.toastr.success('Logo uploaded successfully!');

          // Save encrypted path in form
          this.organizationForm.patchValue({ logo: response.path });

          console.log('logo path in form:', response.path);
        },
        error: (error) => {
          console.error('Image upload failed:', error);

          const errorMessage = error?.error?.error || '';

          if (errorMessage.includes('Only image files')) {
            this.toastr.error(errorMessage, 'Invalid File Type', {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
            });
          } else {
            this.toastr.error('Something went wrong. Please try again later.');
          }
        },
      });
    }
  }
}
