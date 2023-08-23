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
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import {
  CustomUserRoleService,
  CustomUserRoleTenantService,
} from '../../services';
import {
  CreateUserRole,
  CustomUserRoleWithoutPermissionsDto,
  ROLES_PAGINATION_CONFIG,
  UpdateUserRole,
} from './vo/role.dto';
import {
  ApiOkResponsePaginated,
  ApiPagination,
  IdParamUUID,
  VersionNumberParam,
} from '@saas-buildkit/common-types';
import { Permissions, SkipAuth } from '@saas-buildkit/auth';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(
    private readonly customUserRoleService: CustomUserRoleService,
    private readonly customUserRoleTenantService: CustomUserRoleTenantService,
  ) {}

  @Get()
  @SkipAuth()
  @ApiOkResponsePaginated(
    CustomUserRoleWithoutPermissionsDto,
    ROLES_PAGINATION_CONFIG,
  )
  // @Permissions('platform.roles.read')
  @ApiPagination(ROLES_PAGINATION_CONFIG)
  async findAll(
    @Paginate()
    query: PaginateQuery,
  ): Promise<Paginated<CustomUserRoleWithoutPermissionsDto>> {
    return this.customUserRoleService
      .findAll(query, ROLES_PAGINATION_CONFIG)
      .then(({ data, ...other }) => {
        const resultData = data.map((item) => {
          return plainToClass(CustomUserRoleWithoutPermissionsDto, item);
        });

        return {
          ...other,
          data: resultData,
        } as Paginated<CustomUserRoleWithoutPermissionsDto>;
      });
  }

  @Get(':id')
  @Permissions('platform.roles.read')
  async findOne(
    @Param() findOneOptions: IdParamUUID,
  ): Promise<CustomUserRoleWithoutPermissionsDto> {
    return this.customUserRoleTenantService
      .findOneById(findOneOptions.id)
      .then((data) => {
        return plainToClass(CustomUserRoleWithoutPermissionsDto, data);
      });
  }

  @Post()
  @Permissions('platform.roles.create')
  async create(@Body() customUserRole: CreateUserRole) {
    return this.customUserRoleTenantService
      .createOrUpdateEntity(customUserRole)
      .then((item) => {
        return plainToClass(CustomUserRoleWithoutPermissionsDto, item);
      });
  }

  @Put(':id')
  @Permissions('platform.roles.update')
  async updateOne(@Param('id') id: IdParamUUID, @Body() role: UpdateUserRole) {
    return this.customUserRoleTenantService
      .createOrUpdateEntity({
        id,
        ...role,
      })
      .then((item) => {
        return plainToClass(CustomUserRoleWithoutPermissionsDto, item);
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
