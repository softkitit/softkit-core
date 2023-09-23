import { AbstractRedisRepository } from '../../../lib/repository/abstract-redis.repository';
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';

@Injectable()
export class StringRedisRepository extends AbstractRedisRepository<
  string,
  string
> {
  constructor(@InjectRedis() redis: Redis) {
    super(redis);
  }

  async saveString(id: string, str: string): Promise<void> {
    this.redis.set(this.getKey(id), str);
  }

  async getString(id: string): Promise<string | null> {
    return this.redis.get(this.getKey(id));
  }

  protected uniqueIdentifier(t: string): string {
    return t;
  }
}
