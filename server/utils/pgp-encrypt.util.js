// encryption.util.js
import { Sequelize } from 'sequelize';

// Function to encrypt a value using PGP_SYM_ENCRYPT
export const encryptSensitiveData = (value, pubkey) => {
  return Sequelize.literal(`PGP_SYM_ENCRYPT('${value}', '${pubkey}')`);
};
