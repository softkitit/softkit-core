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

  public async archiveOneForTenant(
    id: string,
    version: number,
  ): Promise<boolean> {
    return this.repository
      .update(
        {
          id,
          version,
          deletedAt: IsNull(),
          tenantId: this.clsService.get().tenantId,
        },
        {
          deletedAt: new Date(),
        },
      )
      .then((result) => result.affected === 1);
  }

  public async findOneForTenant(id: string) {
    return this.findOne({
      where: [
        {
          id,
          tenantId: this.clsService.get().tenantId,
        },
      ],
    });
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
    return this.findDefaultRoleByType(RoleType.REGULAR_USER);
  }

  @Transactional()
  async findDefaultAdminRole() {
    return this.findDefaultRoleByType(RoleType.ADMIN);
  }

  private findDefaultRoleByType(roleType: RoleType) {
    return this.repository.findOne({
      where: [
        {
          roleType,
          tenantId: IsNull(),
        },
      ],
      cache: true,
    });
  }
}
