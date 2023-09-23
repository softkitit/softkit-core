import { AbstractRedisRepository } from '../../../lib/repository/abstract-redis.repository';
import { UserEntity } from './vo/user.entity';
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InjectRedis } from '@songkeys/nestjs-redis';

@Injectable()
export class UserRedisRepository extends AbstractRedisRepository<
  UserEntity,
  number
> {
  constructor(@InjectRedis() redis: Redis) {
    super(redis);
  }

  protected override uniqueIdentifier(t: UserEntity): string {
    return t.id.toString();
  }

  protected override keyPrefix(): string {
    return 'user';
  }

  protected override keySuffix(): string {
    return 'account';
  }

  public async saveUser(user: UserEntity): Promise<void> {
    await this.redis.set(this.getKey(user), JSON.stringify(user));
  }

  public getUser(id: number): Promise<UserEntity | undefined> {
    return this.redis.get(this.getKeyById(id)).then((res) => {
      return res ? plainToInstance(UserEntity, JSON.parse(res)) : undefined;
    });
  }
}
