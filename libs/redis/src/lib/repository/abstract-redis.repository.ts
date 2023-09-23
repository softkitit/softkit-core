import Redis from 'ioredis';

export abstract class AbstractRedisRepository<T, ID extends number | string> {
  constructor(protected readonly redis: Redis) {}

  protected abstract uniqueIdentifier(t: T): string;

  public getKey(t: T): string {
    return this.getKeyById(this.uniqueIdentifier(t));
  }

  public getKeyById(id: ID | string): string {
    return [this.keyPrefix(), id, this.keySuffix()]
      .map((s) => s.toString())
      .filter((s) => s.length > 0)
      .join(this.keySeparator());
  }

  protected keySeparator(): string {
    return ':';
  }

  protected keyPrefix(): string {
    return '';
  }

  protected keySuffix(): string {
    return '';
  }
}
