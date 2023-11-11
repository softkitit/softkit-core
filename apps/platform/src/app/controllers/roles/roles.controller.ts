import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRoleService } from '../../services';
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
import { map } from '@softkit/validation';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  @Permissions('platform.roles.read')
  @PaginatedSwaggerDocs(UserRoleWithoutPermission, ROLES_PAGINATION_CONFIG)
  async findAll(
    @Paginate()
    query: PaginateQuery,
  ): Promise<Paginated<UserRoleWithoutPermission>> {
    return this.userRoleService.findAllRolesPaginatedForTenant(
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
    return this.userRoleService
      .findOneForTenant(findOneOptions.id)
      .then((data) => {
        return map(data, UserRoleWithoutPermission);
      });
  }

  @Post()
  @Permissions('platform.roles.create')
  async create(@Body() customUserRole: CreateUserRole) {
    return this.userRoleService
      .createOrUpdateEntity(customUserRole)
      .then((item) => {
        return map(item, UserRoleWithoutPermission);
      });
  }

  @Put(':id')
  @Permissions('platform.roles.update')
  async updateOne(
    @Param() id: IdParamUUID,
    @Body() role: UpdateUserRole,
  ): Promise<UserRoleWithoutPermission> {
    return this.userRoleService
      .createOrUpdateEntity({
        ...id,
        ...role,
      })
      .then((item) => {
        return this.userRoleService.findOneById(item.id);
      })
      .then((item) => {
        return map(item, UserRoleWithoutPermission);
      });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('platform.roles.delete')
  async softDelete(
    @Param() path: IdParamUUID,
    @Query() query: VersionNumberParam,
  ) {
    await this.userRoleService.archiveOneForTenant(path.id, query.version);
  }
}
