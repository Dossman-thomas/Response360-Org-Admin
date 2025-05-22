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
  formSubmitted = false;
  hideErrorsWhileTyping: boolean = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private passwordsService: PasswordsService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    });

    this.email?.valueChanges.subscribe(() => {
      // If the form has been submitted already, and the user is now typing:
      if (this.formSubmitted) {
        this.hideErrorsWhileTyping = true;
      }
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  shouldShowEmailError(): boolean {
    const control = this.email;
    return !!(
      this.formSubmitted &&
      control &&
      control.invalid &&
      !this.hideErrorsWhileTyping
    );
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.hideErrorsWhileTyping = false;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.email?.value;

    this.passwordsService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage = 'Reset link sent! Please check your email.';
        this.forgotPasswordForm.reset();
        this.formSubmitted = false
        this.hideErrorsWhileTyping = false;
      },
      error: (err) => {
        console.error('Reset email error:', err);
        this.errorMessage =
          'Email not found. Failed to send reset email. Please try again.';
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
