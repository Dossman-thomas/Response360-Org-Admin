export const validatePasswordStrength = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d@$!%*?&]{8,}$/; // At least 8 chars, 1 letter, 1 number, 1 special char
    if (!regex.test(password)) {
      return { isValid: false, message: 'Password must be at least 8 characters long and include letters, numbers, and a special character.' };
    }
    return { isValid: true, message: 'Password validation passed' };
  };
  