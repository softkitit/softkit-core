import { capitalize, toCapitalizedWords } from '../';

describe('string manipulation test', () => {
  it.concurrent.each([
    {
      input: 'hello world',
      result: 'Hello World',
    },
    {
      input: 'hi world!',
      result: 'Hi World',
    },
    {
      input: 'HELLO WORLDD',
      result: 'Hello Worldd',
    },
    {
      input: '123 hello 456 world',
      result: 'Hello World',
    },
    {
      input: 'h',
      result: 'H',
    },
    {
      input: '@#$%^&*()',
      result: '',
    },
    {
      input: '',
      result: '',
    },
    {
      input: '1234567890',
      result: '',
    },
    {
      input: '-1234567890',
      result: '',
    },
    {
      input: undefined,
      result: '',
    },
  ])('toCapitalizedWords test', ({ input, result }) => {
    expect(toCapitalizedWords(input)).toBe(result);
  });

  it.concurrent.each([
    {
      input: 'hello world',
      result: 'Hello world',
    },
    {
      input: 'hi world!',
      result: 'Hi world!',
    },
    {
      input: 'HELLO WORLDD',
      result: 'HELLO WORLDD',
    },
    {
      input: '123 hello 456 world',
      result: '123 hello 456 world',
    },
    {
      input: 'h',
      result: 'H',
    },
    {
      input: '@#$%^&*()',
      result: '@#$%^&*()',
    },
    {
      input: '',
      result: '',
    },
    {
      input: '1234567890',
      result: '1234567890',
    },
    {
      input: '-1234567890',
      result: '-1234567890',
    },
  ])('capitalize test', ({ input, result }) => {
    expect(capitalize(input)).toBe(result);
  });
});
