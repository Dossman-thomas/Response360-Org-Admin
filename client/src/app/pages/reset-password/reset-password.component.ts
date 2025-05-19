import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordsService } from 'src/app/services/passwords.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token!: string;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordsService: PasswordsService
  ) {}

  ngOnInit(): void {
    // Extract the token directly from the query parameters without decoding it
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
    if (tokenFromUrl) {
      this.token = tokenFromUrl;  // Don't decode it here
    }

    // Initialize the form
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordsMatchValidator],
      }
    );
  }

  get newPassword(): AbstractControl | null {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword(): AbstractControl | null {
    return this.resetPasswordForm.get('confirmPassword');
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return;

    this.isSubmitting = true;
    const newPassword = this.resetPasswordForm.value.newPassword;

    this.passwordsService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Your password has been reset successfully.';
        this.errorMessage = '';
        this.resetPasswordForm.reset();
        setTimeout(() => {
          this.router.navigate(['/super-admin-login']);
        }, 2500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong.';
        this.successMessage = '';
        this.isSubmitting = false;
      },
    });
  }
}
