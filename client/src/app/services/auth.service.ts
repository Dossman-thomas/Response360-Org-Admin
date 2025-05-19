import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../shared/environments/environment';
import { CryptoService } from './crypto.service';
import { getHeaders } from '../utils/utils/getHeaders.util';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // The URL for the authentication API
  private baseUrl = `${environment.backendUrl}/auth/super-admin`;

  constructor(
    private http: HttpClient,
    private cryptoService: CryptoService,
    private router: Router,
  ) {
    this.checkInitialAuthState();
    window.addEventListener('popstate', this.handlePopStateEvent.bind(this));
  }

  private checkInitialAuthState() {
    const token = localStorage.getItem('token');
    this.isLoggedInSubject.next(!!token);
  }

  private handlePopStateEvent() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoggedInSubject.next(false); // Update the subject if the token is missing
      this.router.navigate(['/super-admin-login']);
    }
  }

  setLoggedInState(state: boolean) {
    this.isLoggedInSubject.next(state);
  }

  login(user_email: string, user_password: string, rememberMe: boolean) {
    const encryptedPayload = this.cryptoService.Encrypt({
      user_email,
      user_password,
      rememberMe,
    });
  
    return this.http.post<any>(
      `${this.baseUrl}/login`,
      { payload: encryptedPayload },
      { headers: getHeaders() }
    ).pipe(
      catchError((error) => {
        const backendError = error?.error;
  
        // Check for specific rate-limit code
        if (backendError?.code === 'TOO_MANY_ATTEMPTS') {
          return throwError(() => new Error('Too many login attempts. Please try again in 15 minutes.'));
        }
  
        // Handle other errors generically
        return throwError(() => new Error(backendError?.message || 'Login failed. Please try again.'));
      })
    );
  }
  

  logout() {
    // Clear localStorage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Update authentication state
    this.isLoggedInSubject.next(false);

    // Navigate to login page after logout
    this.router.navigate(['/super-admin-login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Check token presence
  }
}
