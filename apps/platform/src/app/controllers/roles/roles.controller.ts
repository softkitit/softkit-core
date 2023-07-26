import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { CustomUserRoleService } from '../../services';
import { CustomUserRoleWithoutPermissionsDto } from './vo/role.dto';
import { ApiOkResponsePaginated, InfinityPaginationResultType } from "@saas-buildkit/common-types";
import { Permissions } from "@saas-buildkit/auth";

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(private readonly customUserRoleService: CustomUserRoleService) {}

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
}
