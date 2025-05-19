import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { CryptoService } from '../../../services/crypto.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isDropdownOpen: boolean = false;
  userEmail: string = '';
  userId: string | null = null; // Initialize userId as null

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;

    let decryptedUserId: string;
    try {
      decryptedUserId = this.cryptoService.Decrypt(storedUserId);
    } catch (err) {
      console.error('Failed to decrypt user ID from local storage:', err);
      return;
    }

    this.userId = decryptedUserId;
    this.fetchUserDetails(decryptedUserId);
  }

  fetchUserDetails(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (userData) => {
        this.userEmail = userData.user_email;
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
