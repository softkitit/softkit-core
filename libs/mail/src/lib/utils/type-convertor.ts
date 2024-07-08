import { Readable } from 'node:stream';

export async function toBase64(
  input: string | Buffer | Readable | Uint8Array,
): Promise<string> {
  if (typeof input === 'string') {
    return Buffer.from(input, 'utf8').toString('base64');
  } else if (Buffer.isBuffer(input)) {
    return input.toString('base64');
  } else if (input instanceof Uint8Array) {
    return Buffer.from(input).toString('base64');
  } else if (input instanceof Readable) {
    return streamToBase64(input);
  } else {
    throw new TypeError('Unsupported input type.');
  }
}

async function streamToBase64(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(new Uint8Array(Buffer.from(chunk)));
    });

    stream.on('end', () => {
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const concatenated = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      resolve(Buffer.from(concatenated).toString('base64'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
