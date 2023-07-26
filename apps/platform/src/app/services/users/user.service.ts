import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { User } from '../../database/entities';
import { UserStatus } from '../../database/entities/user/types/user-status.enum';
import { UserRepository } from '../../repositories';
import { BaseEntityService } from "@saas-buildkit/typeorm-service";

@Injectable()
export class UserService extends BaseEntityService<User, UserRepository> {
  constructor(private readonly usersRepository: UserRepository) {
    super(usersRepository);
  }

  @Transactional()
  async updateUserStatus(id: string, status: UserStatus) {
    const updateResult = await this.usersRepository.update(id, {
      status,
    });

    return updateResult.affected === 1;
  }

  @Transactional()
  async findOneByEmailWithRoles(email: string, tenantId?: string) {
    return this.findOne(
      {
        relations: ['roles'],
        where: {
          email: email.toLowerCase().trim(),
          ...(tenantId ? { tenantId } : {}),
        },
      },
      false,
    );
  }
}
