import { HttpHeaders } from '@angular/common/http';
// import { CryptoService } from '../../services/crypto.service';

export function getHeaders(useJson: boolean = true): HttpHeaders {
  let headers = new HttpHeaders();

  // Future-proof: add Auth when ready
  // const encryptedToken = localStorage.getItem('token');
  // const token = CryptoService.Decrypt(encryptedToken);
  // headers = headers.set('Authorization', `Bearer ${token}`);

  if (useJson) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return headers;
}
