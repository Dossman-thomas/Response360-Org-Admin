import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../shared/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { CryptoService } from './crypto.service';
import { getHeaders } from '../utils/utils/getHeaders.util';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private baseUrl = `${environment.backendUrl}/stats`;

  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

  // Function to get the dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/count`, { headers: getHeaders() })
      .pipe(
        map((response: any) => {
          const decrypted = this.cryptoService.Decrypt(response.data);

          return decrypted;
        }),
        catchError((error) => {
          console.error('Failed to fetch dashboard stats:', error);
          return throwError(() => new Error('Unable to retrieve stats'));
        })
      );
  }
}
