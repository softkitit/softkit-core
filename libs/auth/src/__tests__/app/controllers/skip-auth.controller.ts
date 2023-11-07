import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from '../../../lib/decorators/skip-auth.decorator';
import { Permissions } from '../../../lib/decorators/permission.decorator';
import { ClsService } from 'nestjs-cls';
import { TenantClsStore } from '@softkit/typeorm';

@Controller('skip-auth')
@SkipAuth()
export class SkipAuthController {
  constructor(private readonly clsService: ClsService<TenantClsStore>) {}

  @Get()
  async skipAuth() {
    return 'hello';
  }

  @Get('/cls-store')
  async getClsStore() {
    return this.clsService.get();
  }

  /**
   * This is for sure a mistake
   * */
  @Get('secured')
  @Permissions('allow')
  async withPermission() {
    return 'hello';
  }
}
