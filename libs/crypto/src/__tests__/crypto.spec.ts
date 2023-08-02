import {
  generateRandomId,
  generateRandomIdAsync,
  generateRandomIdWithoutSpecialCharacters,
  generateRandomNumber,
  hashPassword,
  verifyPassword,
} from '../index';

describe('crypto tests', () => {
  it.each(['a'.repeat(32), 'a'.repeat(64), 'a'.repeat(128), 'a'.repeat(256)])(
    'hash and compare: %s',
    async (password) => {
      const hashedPassword = await hashPassword(password);
      const isPasswordValid = await verifyPassword(password, hashedPassword);
      expect(isPasswordValid).toBe(true);
    },
  );

  it('get random number', () => {
    const randomNumber = generateRandomNumber();
    expect(randomNumber).toBeGreaterThan(0);
    expect(randomNumber).toBeLessThan(1_000_000);
  });

  it('get random number with length', () => {
    const randomNumber = generateRandomNumber(10);
    expect(randomNumber).toBeGreaterThan(0);
    expect(randomNumber).toBeLessThan(10_000_000_000);
  });

  it('get random string without special characters', () => {
    const randomString = generateRandomIdWithoutSpecialCharacters();
    expect(randomString).toHaveLength(11);
    expect(randomString).toMatch(/^[\dA-Z]+$/);
  });

  it('get random string async', async () => {
    const randomString = await generateRandomIdAsync();
    expect(randomString).toHaveLength(21);
  });

  it('get random string sync', async () => {
    const randomString = generateRandomId();
    expect(randomString).toHaveLength(21);
  });
});
