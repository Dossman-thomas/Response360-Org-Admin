import { Component, OnInit } from '@angular/core';
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
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Check if the user is already authenticated and redirect to the dashboard if true
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/super-admin-dashboard']);
      return;
    }

    // Check for stored credentials in cookies and populate the fields
    const storedEmail = this.cookieService.get('email');
    const storedPassword = this.cookieService.get('password');
    const storedRememberMe = this.cookieService.get('rememberMe');

    if (storedEmail) {
      this.email = this.cryptoService.Decrypt(storedEmail);
    }

    if (storedPassword) {
      this.password = this.cryptoService.Decrypt(storedPassword);
    }

    if (storedRememberMe) {
      this.rememberMe = true;
    }
  }

  onSubmit() {
    this.authService
      .login(this.email, this.password, this.rememberMe)
      .subscribe({
        next: (response) => {
          const decrypted = this.cryptoService.Decrypt(response.data);

          const { token, userId } = decrypted;

          // Store token and user ID
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);

          const encryptedEmail = this.cryptoService.Encrypt(this.email);
          const encryptedPassword = this.cryptoService.Encrypt(this.password);

          // Handle "Remember Me" functionality
          if (this.rememberMe) {
            this.cookieService.set('email', String(encryptedEmail), 90);
            this.cookieService.set('password', String(encryptedPassword), 90);
            this.cookieService.set('rememberMe', 'true', 90);
          } else {
            this.cookieService.delete('email');
            this.cookieService.delete('password');
            this.cookieService.delete('rememberMe');
          }

          // Update authentication state
          this.authService.setLoggedInState(true);

          this.toastr.success('Logged in successfully!');
          this.router.navigate(['/super-admin-dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
        
          if (err.message.includes('Too many login attempts')) {
            this.toastr.error(
              'Too many login attempts. Try again in 15 minutes.',
              'Login Blocked', // ← required to pass the options as third param
              {
                timeOut: 4000,
                closeButton: true,
                progressBar: true,
                extendedTimeOut: 1000,
              }
            );
            
          } else {
            this.toastr.error('Invalid credentials. Please try again.');
          }
        },
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  passwordPattern = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$'; // Regex for password
}
