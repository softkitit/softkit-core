import { Controller, Get } from '@nestjs/common';
import { Permissions } from '../../../lib/decorators/permission.decorator';
import { Roles } from '../../../lib/decorators/role.decorator';
import { RoleType } from './vo/role-type';
import { SkipAuth } from '../../../lib/decorators/skip-auth.decorator';

@Controller('roles')
export class RolesController {
  constructor() {}

  @Get('admin-only')
  @Roles<RoleType>(RoleType.ADMIN)
  async adminOnly() {
    return 'hello';
  }

  @Get('admin-or-regular')
  @Roles<RoleType>([RoleType.ADMIN, RoleType.REGULAR])
  async adminOrRegular() {
    return 'hello';
  }

  @Get('admin-or-permissions')
  @Permissions(['admin.user.create', 'admin.user.update'])
  @Roles<RoleType>(RoleType.ADMIN)
  async adminOrPermission() {
    return 'hello';
  }

  @SkipAuth()
  @Get('skip-auth-and-roles')
  @Roles<RoleType>(RoleType.ADMIN)
  async anyMatch() {
    return 'hello';
  }
}
