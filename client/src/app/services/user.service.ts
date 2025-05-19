import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';
import { getHeaders } from '../utils/utils/getHeaders.util';
import { environment } from '../shared/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.backendUrl}/user`;
  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

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
