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
  UpdateUserRole,
} from './vo/role.dto';
import {
  ApiOkResponsePaginated,
  InfinityPaginationResultType,
} from '@saas-buildkit/common-types';
import { Permissions } from '@saas-buildkit/auth';

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
  @ApiOkResponsePaginated(CustomUserRoleWithoutPermissionsDto)
  @Permissions('platform.roles.read')
  async findAll(): Promise<
    InfinityPaginationResultType<CustomUserRoleWithoutPermissionsDto>
  > {
    return this.customUserRoleService.findAll().then(({ data, ...other }) => {
      const resultData = data.map((item) => {
        return plainToClass(CustomUserRoleWithoutPermissionsDto, item);
      });

      return {
        ...other,
        data: resultData,
      };
    });
  }

  @Get()
  @ApiOkResponsePaginated(CustomUserRoleWithoutPermissionsDto)
  @Permissions('platform.roles.read')
  async findOne(
    @Param('id') id: string,
  ): Promise<CustomUserRoleWithoutPermissionsDto> {
    return this.customUserRoleTenantService.findOneById(id).then((data) => {
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
  async updateOne(@Param('id') id: string, @Body() role: UpdateUserRole) {
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
  async softDelete(@Param('id') id: string, @Query('version') version: number) {
    return this.customUserRoleTenantService.archive(id, version);
  }
}
