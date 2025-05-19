import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CryptoService } from './crypto.service';
import { environment } from '../shared/environments/environment';
import { getHeaders } from '../utils/utils/getHeaders.util';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {

  private baseUrl = `${environment.backendUrl}/image`;

  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

  uploadLogo(
    formData: FormData
  ): Observable<{ message: string; path: string }> {
    return this.http
      .post<any>(
        `${this.baseUrl}/upload-logo`,
        formData,
        {
          headers: getHeaders(false), // Set to false for FormData
        }
      )
      .pipe(
        map((response) => ({
          message: response.message,
          path: this.cryptoService.Decrypt(response.data.path),
        })),
      catchError((error) => {
        if (
          error?.error?.code === 'INVALID_FILE_TYPE' ||
          error?.error?.message?.includes('Only image files')
        ) {
          throw new Error('Only image files (jpeg, jpg, png, gif) are allowed.');
        }
        throw error;
      })
      );
  }
}
