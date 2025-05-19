const getRandomCharacter = (charset) => {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
};

export const generatePassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+[]{}|;:,.<>?';

  // Ensure at least one character from each set
  const password = [
    getRandomCharacter(lower),
    getRandomCharacter(upper),
    getRandomCharacter(digits),
    getRandomCharacter(special),
  ];

  // Add random characters to meet the 8 character length requirement
  const allChars = lower + upper + digits + special;
  while (password.length < 8) {
    password.push(getRandomCharacter(allChars));
  }

  // Shuffle the password to avoid predictable patterns
  return password.sort(() => Math.random() - 0.5).join('');
};
