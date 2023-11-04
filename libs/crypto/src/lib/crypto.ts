import * as argon2 from 'argon2';
import { customAlphabet, nanoid } from 'nanoid';

const nanoidNoSpecialCharacters = customAlphabet(
  '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
);

const nanoidOnlyNumbers = customAlphabet('1234567890');

export async function generateRandomIdAsync() {
  return nanoid();
}

export function generateRandomId() {
  return nanoid();
}

export function generateRandomIdWithoutSpecialCharacters(length = 11) {
  return nanoidNoSpecialCharacters(length);
}

export function generateRandomNumber(length = 6): number {
  return Number.parseInt(nanoidOnlyNumbers(length));
}

/**
 * todo add salt
 * */
export function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return argon2.verify(hashedPassword, password);
}
