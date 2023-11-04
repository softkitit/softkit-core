import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { UserRoleService, UserRoleTenantService } from '../../services';
import {
  CreateUserRole,
  UserRoleWithoutPermission,
  ROLES_PAGINATION_CONFIG,
  UpdateUserRole,
} from './vo/role.dto';
import { IdParamUUID, VersionNumberParam } from '@softkit/common-types';
import { Permissions } from '@softkit/auth';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { RolesApi } from '@softkit/platform-client';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@ApiBearerAuth()
export class RolesController {
  constructor(
    private readonly customUserRoleService: UserRoleService,
    private readonly rolesApi: RolesApi,
    private readonly customUserRoleTenantService: UserRoleTenantService,
  ) {}

  @Get()
  @PaginatedSwaggerDocs(UserRoleWithoutPermission, ROLES_PAGINATION_CONFIG)
  async findAll(
    @Paginate()
    query: PaginateQuery,
  ): Promise<Paginated<UserRoleWithoutPermission>> {
    return this.customUserRoleService.findAllRolesPaginatedForTenant(
      query,
      ROLES_PAGINATION_CONFIG,
      UserRoleWithoutPermission,
    );
  }

  @Get(':id')
  @Permissions('platform.roles.read')
  async findOne(
    @Param() findOneOptions: IdParamUUID,
  ): Promise<UserRoleWithoutPermission> {
    return this.customUserRoleTenantService
      .findOneById(findOneOptions.id)
      .then((data) => {
        return plainToClass(UserRoleWithoutPermission, data);
      });
  }

  @Post()
  @Permissions('platform.roles.create')
  async create(@Body() customUserRole: CreateUserRole) {
    return this.customUserRoleTenantService
      .createOrUpdateEntity(customUserRole)
      .then((item) => {
        return plainToClass(UserRoleWithoutPermission, item);
      });
  }

  @Put(':id')
  @Permissions('platform.roles.update')
  async updateOne(@Param() id: IdParamUUID, @Body() role: UpdateUserRole) {
    return this.customUserRoleTenantService
      .createOrUpdateEntity({
        ...id,
        ...role,
      })
      .then((item) => {
        return plainToClass(UserRoleWithoutPermission, item);
      });
  }

  @Delete(':id')
  @Permissions('platform.roles.delete')
  async softDelete(
    @Param() path: IdParamUUID,
    @Query() query: VersionNumberParam,
  ) {
    return this.customUserRoleTenantService.archive(path.id, query.version);
  }
}
