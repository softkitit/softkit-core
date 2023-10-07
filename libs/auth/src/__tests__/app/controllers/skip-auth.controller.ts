import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from '../../../lib/decorators/skip-auth.decorator';
import { Permissions } from '../../../lib/decorators/permission.decorator';

@Controller('skip-auth')
@SkipAuth()
export class SkipAuthController {
  @Get()
  async skipAuth() {
    return 'hello';
  }

  @Get('secured')
  @Permissions('allow')
  async withPermission() {
    return 'hello';
  }
}
