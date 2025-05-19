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
export class OrganizationService {
  private baseUrl = `${environment.backendUrl}/organization`;

  constructor(private http: HttpClient, private cryptoService: CryptoService) {}

  // Create an organization
  createOrganization(
    orgName: string,
    orgEmail: string,
    orgPhone: string,
    registeredAddress: string,
    orgType: string,
    jurisdictionSize: string,
    website: string,
    adminFirstName: string,
    adminLastName: string,
    adminEmail: string,
    adminPhone: string,
    logo?: string
  ): Observable<any> {
    // retrieve logged in user's ID from local storage
    const userId = localStorage.getItem('userId');
    const decryptedUserId = userId ? this.cryptoService.Decrypt(userId) : null;

    // Encrypt the form data into a single payload
    const payload: any = {
      orgName,
      orgEmail,
      orgPhone,
      registeredAddress,
      orgType,
      jurisdictionSize,
      website,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
      decryptedUserId,
    };

    if (logo !== undefined) {
      payload.logo = logo;
    }

    const encryptedPayload = this.cryptoService.Encrypt(payload);

    // Send the encrypted payload to the backend and handle errors
    return this.http
      .post<any>(
        `${this.baseUrl}/create`,
        { payload: encryptedPayload },
        { headers: getHeaders() }
      )
      .pipe(
        catchError((error) => {
          const msg = error?.error?.message || '';

          // Check for both orgEmail and adminEmail errors
          const errors: any = {};
          if (msg.includes('Organization email is already in use')) {
            errors.orgEmail = 'Organization email is already in use.';
          }
          if (msg.includes('Admin email is already in use')) {
            errors.adminEmail = 'Admin email is already in use.';
          }

          // If there are errors, return them in the observable
          if (Object.keys(errors).length > 0) {
            return throwError({ error: errors });
          }

          // If no specific errors, pass through the original error
          return throwError(error);
        })
      );
  }

  // Read all organizations
  getAllOrganizations(body: any): Observable<any> {
    const encryptedPayload = this.cryptoService.Encrypt(body);

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
          return throwError(() => new Error('Failed to fetch organizations'));
        })
      );
  }

  // Read a single organization by ID
  getOrganizationById(orgId: string): Observable<any> {
    // Encode encrypted orgId to make it safe for URL
    const encodedOrgId = encodeURIComponent(orgId);

    // Send the encrypted ID to the backend
    return this.http
      .get<any>(`${this.baseUrl}/read/${encodedOrgId}`, {
        headers: getHeaders(),
      })
      .pipe(
        map((response) => {
          // Assuming the encrypted data is in response.data
          const decryptedData = this.cryptoService.Decrypt(response.data);

          // Now return the decrypted data
          return decryptedData;
        })
      );
  }

  // Update an organization
  updateOrganization(
    orgId: string,
    orgName: string,
    orgEmail: string,
    orgPhone: string,
    registeredAddress: string,
    orgType: string,
    jurisdictionSize: string,
    website: string,
    status: string,
    logo?: string
  ): Observable<any> {
    // retrieve logged in user's ID from local storage
    const userId = localStorage.getItem('userId');
    const decryptedUserId = userId ? this.cryptoService.Decrypt(userId) : null;

    // Encrypt the form data into a single payload
    const payload: any = {
      orgName,
      orgEmail,
      orgPhone,
      registeredAddress,
      orgType,
      jurisdictionSize,
      website,
      status,
      decryptedUserId,
    };

    if (logo !== undefined) {
      payload.logo = logo;
    }

    const encryptedPayload = this.cryptoService.Encrypt(payload);

    // Encode encrypted orgId to make it safe for URL
    const encodedOrgId = encodeURIComponent(orgId);

    // Send the encrypted payload to the backend and handle errors
    return this.http
      .put<any>(
        `${this.baseUrl}/update/${encodedOrgId}`,
        { payload: encryptedPayload },
        { headers: getHeaders() }
      )
      .pipe(
        catchError((error) => {
          // Check if the error is related to duplicate emails and return a structured error
          if (error.error && error.error.message) {
            if (
              error.error.message.includes(
                'Organization email is already in use'
              )
            ) {
              return throwError(() => ({
                error: {
                  message: 'Organization email is already in use.',
                  field: 'orgEmail',
                },
              }));
            }
          }
          // For other errors, throw the error as-is
          return throwError(() => error);
        })
      );
  }

  // Delete an organization (soft delete)
  deleteOrganization(orgId: string): Observable<any> {
    // Retrieve logged-in user's encrypted ID from local storage
    const userId = localStorage.getItem('userId');
    const decryptedUserId = userId ? this.cryptoService.Decrypt(userId) : null;

    // Encrypt the orgId for the URL
    const encryptedOrgId = this.cryptoService.Encrypt(orgId);

    // Ensure that encryptedOrgId is a string (if it's not, extract the string part)
    const orgIdString =
      typeof encryptedOrgId === 'string'
        ? encryptedOrgId
        : encryptedOrgId.payload;

    // Encrypt the payload properly, but keep orgId plain (decrypted) for the body
    const encryptedPayload = this.cryptoService.Encrypt({
      orgId, // Plain orgId in the payload, since backend expects the decrypted ID here
      userId: decryptedUserId,
    });

    // Encode encrypted orgId to make it safe for URL
    const encodedOrgId = encodeURIComponent(orgIdString);

    // Send the encrypted orgId in the URL and the encrypted payload in the body
    return this.http.delete<any>(
      `${this.baseUrl}/delete/${encodedOrgId}`,
      {
        headers: getHeaders(),
        body: { payload: encryptedPayload },
      }
    );
  }
}
