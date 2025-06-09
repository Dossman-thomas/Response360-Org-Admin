import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import { OrganizationService } from '../../services/organization.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-org-admin-profile',
  templateUrl: './org-admin-profile.component.html',
  styleUrls: ['./org-admin-profile.component.css'],
})
export class OrgAdminProfileComponent implements OnInit {
  orgProfileForm!: FormGroup;
  decryptedUserId!: string;
  decryptedOrgId!: string;
  phoneNumberPattern = /^[0-9\-()+ ]+$/;
  websitePattern = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+([/#?]?.*)?$/;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private userService: UserService,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const encryptedUserId = localStorage.getItem('userId');
    const encryptedOrgId = localStorage.getItem('orgId');

    if (!encryptedUserId || !encryptedOrgId) {
      console.error('Missing encrypted IDs.');
      return;
    }

    this.decryptedUserId = this.cryptoService.Decrypt(encryptedUserId);
    this.decryptedOrgId = this.cryptoService.Decrypt(encryptedOrgId);

    this.orgProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(this.phoneNumberPattern)],
      ],
      address: ['', Validators.required],
      orgName: ['', Validators.required],
      website: [
        '',
        [
          Validators.required,
          Validators.pattern(this.websitePattern),
        ],
      ],
      orgType: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loadProfileData();
  }

  private loadProfileData(): void {
    try {
      const encryptedUserId = localStorage.getItem('userId');
      const encryptedOrgId = localStorage.getItem('orgId');

      if (!encryptedUserId || !encryptedOrgId) {
        console.error('Missing encrypted IDs in localStorage');
        return;
      }

      const userId = this.cryptoService.Decrypt(encryptedUserId);
      const orgId = this.cryptoService.Decrypt(encryptedOrgId);

      this.userService.getUserById(userId).subscribe((userData) => {
        this.orgProfileForm.patchValue({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          title: userData.user_role || '',
          phoneNumber: userData.user_phone_number || '',
        });
      });

      this.organizationService
        .getOrganizationById(orgId)
        .subscribe((orgData) => {
          this.orgProfileForm.patchValue({
            address: orgData.registeredAddress || '',
            orgName: orgData.orgName || '',
            website: orgData.website || '',
            orgType: orgData.orgType || '',
            email: orgData.orgEmail || '',
          });
        });
    } catch (error) {
      console.error('Error decrypting or fetching data:', error);
    }
  }

  onSubmit(): void {
    console.log('Submit clicked');

    if (this.orgProfileForm.invalid) {
      this.orgProfileForm.markAllAsTouched();
      return;
    }

    const formData = this.orgProfileForm.value;
    console.log('Submitting form data:', formData);

    // USER update
    const userUpdatePayload = {
      userId: this.decryptedUserId,
      updatedBy: this.decryptedUserId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      user_phone_number: formData.phoneNumber,
      user_role: formData.title,
    };

    // ORG update
    const orgUpdatePayload = {
      orgId: this.decryptedOrgId,
      orgName: formData.orgName,
      orgEmail: formData.email,
      orgPhone: formData.phoneNumber,
      registeredAddress: formData.address,
      orgType: formData.orgType,
      website: formData.website,
      decryptedUserId: this.decryptedUserId,
    };

    // First update user, then org
    this.userService.updateUser(userUpdatePayload).subscribe({
      next: () => {
        this.organizationService
          .updateOrganization(
            orgUpdatePayload.orgId,
            orgUpdatePayload.orgName,
            orgUpdatePayload.orgEmail,
            orgUpdatePayload.orgPhone,
            orgUpdatePayload.registeredAddress,
            orgUpdatePayload.orgType,
            orgUpdatePayload.website,
            orgUpdatePayload.decryptedUserId
          )
          .subscribe({
            next: () => {
              console.log('User and organization updated successfully!');
              this.toastr.success('Profile updated successfully!');
              this.router.navigate(['/org-admin-dashboard']);
            },
            error: (orgErr) => {
              console.error('Organization update failed:', orgErr);
            },
          });
      },
      error: (userErr) => {
        console.error('User update failed:', userErr);
        this.toastr.error('Failed to update profile. Please try again later.');
      },
    });
  }

  navigateToOrgAdminDashboard(): void {
    this.router.navigate(['/org-admin-dashboard']);
  }
}
