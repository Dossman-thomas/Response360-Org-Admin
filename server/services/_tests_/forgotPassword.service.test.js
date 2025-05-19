// forgotPassword.service.test.js
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// 1. Mock modules using jest.unstable_mockModule
jest.unstable_mockModule('../index.js', () => ({
  forgotPasswordService: jest.fn(),
  getUserByEmailService: jest.fn(),
  encryptService: jest.fn(),
  decryptService: jest.fn(),
  sendResetPasswordEmailService: jest.fn(),
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
  },
}));

jest.unstable_mockModule('../../utils/index.js', () => ({
  createError: jest.fn((msg, status, meta) => ({ message: msg, status, ...meta })),
}));

jest.unstable_mockModule('../../config/index.js', () => ({
  env: {
    jwt: {
      secret: 'test-secret',
      forgotPass: '15m',
    },
    frontEndUrl: 'https://frontend.com',
  },
}));

// 2. Now, dynamically import the modules AFTER the mocks
const {
  forgotPasswordService,
  getUserByEmailService,
  encryptService,
  decryptService,
  sendResetPasswordEmailService
} = await import('../index.js');

const { env } = await import('../../config/index.js');

const { createError } = await import('../../utils/index.js');

const jwtLib = await import('jsonwebtoken');
const jwtSign = jwtLib.default.sign;

// 3. Begin your tests
describe('forgotPasswordService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for a valid encrypted payload', async () => {
    const encryptedPayload = 'validEncryptedPayload';
    const mockUser = {
      user_id: '123',
      user_email: 'test@example.com',
      first_name: 'Tom',
    };
    const jwtToken = 'jwt.token.here';
    const encryptedToken = 'encryptedToken';
    const encryptedEmailPayload = 'encryptedEmailPayload';

    // Set up mocked return values
    getUserByEmailService.mockResolvedValue(mockUser);
    decryptService.mockResolvedValue(mockUser);
    jwtSign.mockReturnValue(jwtToken);
    encryptService
      .mockResolvedValueOnce(encryptedToken) // for token
      .mockResolvedValueOnce(encryptedEmailPayload); // for email payload
    sendResetPasswordEmailService.mockResolvedValue(true);

    const result = await forgotPasswordService(encryptedPayload);

    expect(result).toBe(true);
    expect(getUserByEmailService).toHaveBeenCalledWith(encryptedPayload);
    expect(decryptService).toHaveBeenCalledWith(mockUser);
    expect(jwtSign).toHaveBeenCalledWith(
      { userId: mockUser.user_id },
      'test-secret',
      { expiresIn: '15m' }
    );
    expect(encryptService).toHaveBeenCalledWith(jwtToken);
    expect(sendResetPasswordEmailService).toHaveBeenCalledWith(encryptedEmailPayload);
  });
});
