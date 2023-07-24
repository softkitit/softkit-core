import { expect } from '@jest/globals';

export function expectNotNullAndGet<T>(v?: T | null): T {
  expect(v).toBeDefined();

  if (v === null || v === undefined) {
    // never will be called
    throw 'Value should not be null or undefined';
  }

  return v;
}
