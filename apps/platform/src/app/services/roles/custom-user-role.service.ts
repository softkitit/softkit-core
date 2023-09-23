import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { UserRole } from '../../database/entities';
import { UserRoleRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';
import { RoleType } from '../../database/entities/roles/types/default-role.enum';
import { IsNull } from 'typeorm';

@Injectable()
export class CustomUserRoleService extends BaseEntityService<
  UserRole,
  UserRoleRepository
> {
  constructor(repository: UserRoleRepository) {
    super(repository);
  }

  @Transactional()
  async findDefaultRole() {
    return await this.repository.findOne({
      where: {
        roleType: RoleType.REGULAR_USER,
        tenantId: IsNull(),
      },
    });
  }

  @Transactional()
  async findDefaultAdminRole() {
    return await this.repository.findOne({
      where: [
        {
          roleType: RoleType.ADMIN,
          tenantId: IsNull(),
        },
        {
          roleType: RoleType.ADMIN,
          tenantId: IsNull(),
        },
      ],
    });
  }
}
