import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';
import { OrganizationService } from '../../services/organization.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-org-admin-profile',
  templateUrl: './org-admin-profile.component.html',
  styleUrls: ['./org-admin-profile.component.css'],
})
export class OrgAdminProfileComponent implements OnInit {
  orgProfileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private userService: UserService,
    private cryptoService: CryptoService
  ) {}

  ngOnInit(): void {
    this.orgProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9\-()+ ]+$/)],
      ],
      address: ['', Validators.required],
      orgName: ['', Validators.required],
      website: [
        '',
        [Validators.required, Validators.pattern(/https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)],
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

      this.organizationService.getOrganizationById(orgId).subscribe((orgData) => {
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
    if (this.orgProfileForm.invalid) {
      this.orgProfileForm.markAllAsTouched();
      return;
    }

    const formData = this.orgProfileForm.value;
    console.log('Submitting form data:', formData);
    // add submit logic later
  }
}
