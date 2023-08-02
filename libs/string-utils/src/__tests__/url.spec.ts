import { faker } from '@faker-js/faker';
import {
  decodeBase64StringObjectFromUrl,
  encodeObjectToBase64ForUrl,
} from '../';

describe('url manipulation test', () => {
  it.each([
    faker.string.uuid(),
    faker.string.alphanumeric(100),
    faker.string.binary({
      length: 100,
    }),
    faker.string.hexadecimal({
      length: 100,
    }),
    faker.string.nanoid(100),
    faker.internet.email(),
    faker.string.alpha({
      length: 100,
    }),
  ])('url part to base64 and from base64: %s', (strToTransform: string) => {
    const objectToTransform = {
      str: strToTransform,
    };
    const encoded = encodeObjectToBase64ForUrl(objectToTransform);

    const decoded = decodeBase64StringObjectFromUrl(encoded);
    expect(objectToTransform).toStrictEqual(decoded);
  });

  it('empty object test', () => {
    const objectToTransform = {};
    const encoded = encodeObjectToBase64ForUrl(objectToTransform);

    const decoded = decodeBase64StringObjectFromUrl(encoded);
    expect(objectToTransform).toStrictEqual(decoded);
  });

  it('undefined object test', () => {
    const encoded = undefined;

    const decoded = decodeBase64StringObjectFromUrl(encoded);
    expect(decoded).toStrictEqual({});
  });

  it('invalid base64 decode', async () => {
    await expect(
      (async () => decodeBase64StringObjectFromUrl('invalidbase64'))(),
    ).resolves.toStrictEqual({});
  });
});
