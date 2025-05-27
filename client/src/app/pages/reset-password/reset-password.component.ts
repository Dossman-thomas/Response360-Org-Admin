import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
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
  formSubmitted = false;
  hideErrorsWhileTyping = false;
  passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordsService: PasswordsService
  ) {}

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
    if (tokenFromUrl) this.token = tokenFromUrl;

    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(this.passwordPattern),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.passwordsMatchValidator] }
    );

    // Hide errors while typing
    this.resetPasswordForm.valueChanges.subscribe(() => {
      if (this.formSubmitted) this.hideErrorsWhileTyping = true;
    });
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

  shouldShowNewPasswordError(): boolean {
    const control = this.newPassword;
    return !!(
      this.formSubmitted &&
      control &&
      control.invalid &&
      !this.hideErrorsWhileTyping
    );
  }

  shouldShowConfirmPasswordError(): boolean {
    const control = this.confirmPassword;
    return !!(
      this.formSubmitted &&
      (control?.invalid ||
        this.resetPasswordForm.hasError('passwordsMismatch')) &&
      !this.hideErrorsWhileTyping
    );
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.hideErrorsWhileTyping = false;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const newPassword = this.resetPasswordForm.value.newPassword;

    this.passwordsService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Your password has been reset successfully.';
        this.errorMessage = '';
        this.resetPasswordForm.reset();
        this.formSubmitted = false;
        this.hideErrorsWhileTyping = false;

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
