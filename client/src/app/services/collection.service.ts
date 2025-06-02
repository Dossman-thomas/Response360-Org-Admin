import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getHeaders } from '../utils/utils/getHeaders.util';
import { Observable, throwError } from 'rxjs';
import { CryptoService } from './crypto.service';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../shared/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private baseUrl = `${environment.backendUrl}/collection`;

  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

  // create Collections

  // Read Active Collections
  getActiveCollections(orgId: string, body: any): Observable<any> {
    if (!orgId) {
      return throwError(() => new Error('Organization ID is required'));
    }

    // body should contain pagination info for now
    const payload = { org_id: orgId, ...body };

    const encryptedPayload = this.cryptoService.Encrypt(payload);

    return this.http
      .post<any>(
        `${this.baseUrl}/read`,
        { payload: encryptedPayload },
        {
          headers: getHeaders(),
        }
      )
      .pipe(
        map((res) => {
          const decryptedData = this.cryptoService.Decrypt(res.data);
          return decryptedData;
        }),
        catchError((error) => {
          console.error('Error occurred:', error);
          return throwError(() => new Error('Failed to fetch collections'));
        })
      );
  }
}
