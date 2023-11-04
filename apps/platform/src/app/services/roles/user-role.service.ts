import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { UserRole } from '../../database/entities';
import { UserRoleRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';
import { RoleType } from '../../database/entities/roles/types/default-role.enum';
import { IsNull } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ClsStore } from '../../common/vo/cls-store';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';

@Injectable()
export class UserRoleService extends BaseEntityService<
  UserRole,
  UserRoleRepository
> {
  constructor(
    repository: UserRoleRepository,
    private readonly clsService: ClsService<ClsStore>,
  ) {
    super(repository);
  }

  async findAllRolesPaginatedForTenant<T>(
    query: PaginateQuery,
    config: PaginateConfig<UserRole>,
    clazz: ClassConstructor<T>,
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
  ): Promise<Paginated<T>> {
    return this.findAllPaginatedAndTransform(
      query,
      {
        ...config,
        where: [
          {
            tenantId: this.clsService.get().tenantId,
          },
          {
            tenantId: IsNull(),
          },
        ],
      },
      clazz,
    );
  }

  @Transactional()
  async findDefaultUserRole() {
    return await this.repository.findOne({
      where: {
        roleType: RoleType.REGULAR_USER,
        tenantId: IsNull(),
      },
      cache: true,
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
      ],
      cache: true,
    });
  }
}
