import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';
import { BaseEntityService } from '../../../lib/base.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService extends BaseEntityService<
  UserEntity,
  'id',
  UserRepository,
  Pick<UserEntity, 'id' | 'version'>
> {
  constructor(userRepository: UserRepository) {
    super(userRepository);
  }

  findOneByFirstName(firstName: string): Promise<UserEntity | undefined> {
    return this.findOne({
      where: {
        firstName,
      },
    });
  }

  findOneByFirstNameWithoutException(
    firstName: string,
  ): Promise<UserEntity | undefined> {
    return this.findOne(
      {
        where: {
          firstName,
        },
      },
      false,
    );
  }
}
