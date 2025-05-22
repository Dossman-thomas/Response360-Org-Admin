import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CryptoService } from '../../services/crypto.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  formSubmitted: boolean = false;
  hideErrorsWhileTyping: boolean = false;
  passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: [
        '',
        [Validators.required, Validators.pattern(this.passwordPattern)],
      ],
      rememberMe: [false],
    });

    // If already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/org-admin-dashboard']);
      return;
    }

    // Populate form from cookies if present
    const storedEmail = this.cookieService.get('email');
    const storedPassword = this.cookieService.get('password');
    const storedRememberMe = this.cookieService.get('rememberMe');

    if (storedEmail) {
      this.loginForm.patchValue({
        email: this.cryptoService.Decrypt(storedEmail),
      });
    }

    if (storedPassword) {
      this.loginForm.patchValue({
        password: this.cryptoService.Decrypt(storedPassword),
      });
    }

    if (storedRememberMe) {
      this.loginForm.patchValue({ rememberMe: true });
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.hideErrorsWhileTyping = false;

    if (this.loginForm.invalid) {
      // Mark all controls as touched so errors show up
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response) => {
        const decrypted = this.cryptoService.Decrypt(response.data);
        const { token, userId, orgId } = decrypted;

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('orgId', orgId);

        const encryptedEmail = this.cryptoService.Encrypt(email);
        const encryptedPassword = this.cryptoService.Encrypt(password);

        if (rememberMe) {
          this.cookieService.set('email', String(encryptedEmail), 90);
          this.cookieService.set('password', String(encryptedPassword), 90);
          this.cookieService.set('rememberMe', 'true', 90);
        } else {
          this.cookieService.delete('email');
          this.cookieService.delete('password');
          this.cookieService.delete('rememberMe');
        }

        this.authService.setLoggedInState(true);
        this.toastr.success('Logged in successfully!');
        this.router.navigate(['/org-admin-dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);

        if (err.message.includes('Too many login attempts')) {
          this.toastr.error(
            'Too many login attempts. Try again in 15 minutes.',
            'Login Blocked',
            { timeOut: 4000, closeButton: true, progressBar: true }
          );
        } else if (err.message.includes('your user account is inactive')) {
          this.toastr.error(
            'Your account is inactive. Please contact your administrator.',
            'User Inactive',
            { timeOut: 4000, closeButton: true, progressBar: true }
          );
        } else if (err.message.includes('organization is inactive')) {
          this.toastr.error(
            'Your organization is inactive. Please contact support.',
            'Organization Inactive',
            { timeOut: 4000, closeButton: true, progressBar: true }
          );
        } else {
          this.toastr.error(
            'Invalid credentials. Please try again.',
            'Login Failed',
            { timeOut: 4000, closeButton: true, progressBar: true }
          );
        }
      },
    });
  }

  // Helper to check if a control should show an error
  shouldShowError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return (
      this.formSubmitted &&
      !this.hideErrorsWhileTyping &&
      !!control &&
      control.invalid === true
    );
  }

  // call this on (input) event
  onFieldInput(): void {
    this.hideErrorsWhileTyping = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // get confirmPassword() {
  //   return this.loginForm.get('confirmPassword');
  // }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }
}
