import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';
import { getHeaders } from '../utils/utils/getHeaders.util';
import { environment } from '../shared/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.backendUrl}/user`;
  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

  // Update a user
  updateUser(payload: {
    userId: string;
    updatedBy: string;
    first_name?: string;
    last_name?: string;
    user_phone_number?: string;
    user_role?: string;
  }): Observable<any> {
    const encryptedPayload = this.cryptoService.Encrypt(payload);

    return this.http
      .put<any>(
        `${this.baseUrl}/update`,
        { payload: encryptedPayload },
        { headers: getHeaders() }
      )
      .pipe(
        catchError((error) =>
          throwError(() => {
            return (
              error.error || {
                message: 'Something went wrong while updating the user.',
              }
            );
          })
        )
      );
  }

  getUserByEmail(userEmail: string): Observable<any> {
    const payload = { user_email: userEmail };
    const encryptedPayload = this.cryptoService.Encrypt(payload);

    return this.http
      .post<any>(
        `${this.baseUrl}/get-by-email`,
        { payload: encryptedPayload },
        { headers: getHeaders() }
      )
      .pipe(
        map((response) => {
          // Access the encrypted data from the response
          const decryptedData = this.cryptoService.Decrypt(response.data);
          return decryptedData;
        })
      );
  }

  getUserById(userId: string): Observable<any> {
    const payload = { user_id: userId };
    const encryptedPayload = this.cryptoService.Encrypt(payload);

    return this.http
      .post<any>(
        `${this.baseUrl}/get-by-id`,
        { payload: encryptedPayload },
        { headers: getHeaders() }
      )
      .pipe(
        map((response) => {
          // Access the encrypted data from the response
          const decryptedData = this.cryptoService.Decrypt(response.data);
          return decryptedData;
        })
      );
  }
}
