import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { AuditService } from './audit.service';
import { Transactional, Propagation } from 'typeorm-transactional';
import { CreateUserDTO } from '../vo/user.dto';
import { BaseTrackedEntityService } from '../../../lib/base-tracked-entity.service';
import { BaseTrackedEntityHelper } from '@softkit/typeorm';

@Injectable()
export class UserService extends BaseTrackedEntityService<
  UserEntity,
  'id',
  UserRepository,
  'id' | 'version',
  keyof BaseTrackedEntityHelper | 'version' | 'id'
> {
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
    return this.upsert(a);
  }

  async findOneByFirstName(firstName: string): Promise<UserEntity | undefined> {
    return await this.repository.findOne({
      firstName,
    });
  }

  findOneByFirstNameWithoutException(
    firstName: string,
  ): Promise<UserEntity | undefined> {
    return this.repository.findOne({ firstName });
  }
}
