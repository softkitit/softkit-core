export class FileNotFoundException extends Error {
  constructor(
    message: string,
    public readonly rootCause?: Error,
  ) {
    super(message);
    this.name = 'FileNotFoundException';
    this.rootCause = rootCause;
  }
}
