import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Temporary test runner
// if (process.argv[2]) {
//   const testPassword = process.argv[2];
//   hashPassword(testPassword).then((hashed) => {
//     console.log(`Plain: ${testPassword}`);
//     console.log(`Hashed: ${hashed}`);
//   });
// }

// Run test with node server/utils/hash-pass.util.js <password>

// Example: node server/utils/hash-pass.util.js Test1234!
// Output: 
// Plain: Test1234!
// Hashed: $2b$10$HiKs5dq3l3xYeBuP/F/d0uQDX/XoZl5qhgz9lMhhvBTOhsftuu1qK