import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordsService } from 'src/app/services/passwords.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private passwordsService: PasswordsService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.email?.value;

    this.passwordsService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage = 'Reset link sent! Please check your email.';
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        console.error('Reset email error:', err);
        this.errorMessage = 'Email not found. Failed to send reset email. Please try again.';
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
