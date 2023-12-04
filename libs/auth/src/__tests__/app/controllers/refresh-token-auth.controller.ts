import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipAuth } from '../../../lib/decorators/skip-auth.decorator';
import { RefreshJwtAuthGuard } from '../../../lib/guards/refresh-jwt-auth.guard';
import { CurrentUser } from '../../../lib/decorators/current-user.decorator';
import { IRefreshTokenPayload } from '../../../lib/vo/payload';

@Controller('refresh-auth')
@SkipAuth()
export class RefreshTokenAuthController {
  @Get()
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuard() {
    return 'hello';
  }

  @Get('/user-context')
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuardContextUserFromPayload(
    @CurrentUser() user: IRefreshTokenPayload,
  ) {
    return user;
  }
}
