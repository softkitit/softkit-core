import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipAuth } from '../../../lib/decorators/skip-auth.decorator';
import { RefreshJwtAuthGuard } from '../../../lib/guards/refresh-jwt-auth.guard';

@Controller('refresh-auth')
@SkipAuth()
export class RefreshTokenAuthController {
  @Get()
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuard() {
    return 'hello';
  }
}
