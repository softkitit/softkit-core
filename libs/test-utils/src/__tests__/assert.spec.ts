import { expectNotNullAndGet } from '../lib/asserts';

describe('custom expect test', () => {
  test('expect not null and get', () => {
    expect(expectNotNullAndGet.bind(null, undefined)).toThrow();
    expect(expectNotNullAndGet.bind(null, null)).toThrow();
    expect(expectNotNullAndGet('string')).toBe('string');
    expect(expectNotNullAndGet(1)).toBe(1);
    expect(expectNotNullAndGet({ key: 'string' })).toStrictEqual({
      key: 'string',
    });
  });
});
