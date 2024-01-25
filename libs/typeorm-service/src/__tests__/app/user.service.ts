import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { BaseEntityService } from '../../lib/base.service';
import { UserRepository } from './user.repository';
import { Propagation, Transactional } from 'typeorm-transactional';
import { AuditService } from './audit.service';
import { CreateUserDTO } from './user.dto';

@Injectable()
export class UserService extends BaseEntityService<UserEntity, UserRepository> {
  constructor(
    userRepository: UserRepository,
    private readonly auditService: AuditService,
  ) {
    super(userRepository);
  }

  @Transactional()
  async signUp(a: CreateUserDTO) {
    await this.auditService.recordGeneralAction(
      'Signup Initiated',
      `attempted with first name: ${a.firstName}`,
    );

    try {
      const entity = await this.actualSignUpProcess(a);

      this.auditService.recordAudit(
        entity.id,
        'Sign up success',
        `first name: ${entity.firstName}`,
      );
      return entity;
    } catch (error) {
      this.auditService.recordGeneralAction(
        'Signup Failed',
        `failed for user: ${a.firstName}`,
      );

      throw error;
    } finally {
      this.auditService.recordGeneralAction(
        'Signup Finished',
        `finished signup for user: ${a.firstName}`,
      );
    }
  }

  @Transactional({ propagation: Propagation.REQUIRES_NEW })
  actualSignUpProcess(a: CreateUserDTO) {
    return this.createOrUpdateEntity(a);
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
