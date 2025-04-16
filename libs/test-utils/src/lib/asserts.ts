import { expect } from '@jest/globals';

// todo move to a separate lib one day
export function expectNotNullAndGet<T>(v?: T | null): T {
  expect(v).toBeDefined();

  if (v === null || v === undefined) {
    // never will be called
    throw 'Value should not be null or undefined';
  }

  return v;
}
