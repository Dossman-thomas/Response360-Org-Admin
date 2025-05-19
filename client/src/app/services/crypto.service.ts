import * as crypto from 'crypto-js';
import { Injectable } from '@angular/core';
import { environment } from '../shared/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private pkey: string = environment.pubkey || '';
  private pubkey: any;

  constructor() {
    if (!this.pkey) {
      throw new Error(
        '❌ CryptoService: Public key is missing in environment variables.'
      );
    }
    // Hash public key with SHA256 to match backend logic
    this.pubkey = crypto.SHA256(this.pkey);
  }

  // Generate a secure random IV (16 bytes)
  private generateIV(): crypto.lib.WordArray {
    return crypto.lib.WordArray.random(16);
  }

  // Encrypt function
  Encrypt(data: any) {
    try {
      if (!data) {
        console.warn('⚠️ Warning: No data provided for encryption.');
        return { payload: '' };
      }

      // Generate a 16-byte random UUID (same as backend)
      const uuid = uuidv4().replace(/-/g, ''); // Removes hyphens
      const iv = this.generateIV(); // Generate IV

      // First-level encryption (use UUID directly as key, no hashing)
      const firstEncrypt = crypto.AES.encrypt(
        JSON.stringify(data),
        crypto.enc.Utf8.parse(uuid),
        { iv }
      ).toString();

      const combined = `${uuid}###${firstEncrypt}`;

      // Second-level encryption with public key
      const finalEncrypt = crypto.AES.encrypt(combined, this.pubkey, {
        iv,
      }).toString();

      // Concatenate final encryption with IV
      const encryptedString = `${finalEncrypt}:${crypto.enc.Base64.stringify(
        iv
      )}`;

      return encryptedString;
    } catch (error) {
      console.error('❌ CryptoService: Error during encryption.', error);
      return { payload: '' };
    }
  }

  // Decrypt function
  Decrypt(payload: string): any {
    try {
      if (!payload) {
        throw new Error('No encrypted text provided for decryption.');
      }

      const [encryptedPayload, ivBase64] = payload.split(':');
      if (!ivBase64) {
        throw new Error('No IV found in encrypted text.');
      }

      const iv = crypto.enc.Base64.parse(ivBase64);

      // First decryption with pubkey
      const decrypted = crypto.AES.decrypt(encryptedPayload, this.pubkey, {
        iv,
      }).toString(crypto.enc.Utf8);

      if (!decrypted) {
        throw new Error('First decryption failed — invalid data.');
      }

      if (!decrypted.includes('###')) {
        throw new Error('Malformed decrypted data — missing delimiter.');
      }

      const [uuid, firstEncryptedData] = decrypted.split('###');
      const firstKey = crypto.enc.Utf8.parse(uuid);

      // Second decryption with UUID key
      const decryptedPayload = crypto.AES.decrypt(
        firstEncryptedData,
        firstKey,
        { iv }
      ).toString(crypto.enc.Utf8);

      return JSON.parse(decryptedPayload);
    } catch (error) {
      console.error('❌ CryptoService: Failed to decrypt data.', error);
      return { error: 'Failed to decrypt data.' };
    }
  }
}
