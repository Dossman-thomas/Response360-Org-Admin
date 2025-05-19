import { encryptSensitiveData } from './pgp-encrypt.util.js';
export const encryptFields = (data, pubkey) => {
    const encryptedData = {};
    for (const key in data) {  // This is working on an object
      if (data[key] !== undefined && data[key] !== null) {
        encryptedData[key] = encryptSensitiveData(data[key], pubkey);
      }
    }
    return encryptedData;
  };
  
