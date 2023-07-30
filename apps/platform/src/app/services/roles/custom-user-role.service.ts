import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CustomUserRole } from '../../database/entities';
import { CustomUserRoleRepository } from '../../repositories';
import { BaseEntityService } from '@saas-buildkit/typeorm-service';
import { RoleType } from '../../database/entities/role/types/default-role.enum';
import { IsNull } from 'typeorm';

@Injectable()
export class CustomUserRoleService extends BaseEntityService<
  CustomUserRole,
  CustomUserRoleRepository
> {
  constructor(repository: CustomUserRoleRepository) {
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
      where: {
        roleType: RoleType.ADMIN,
        tenantId: IsNull(),
      },
    });
  }
}
