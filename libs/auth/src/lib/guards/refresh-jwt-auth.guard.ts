import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt } from 'passport-jwt';
import { TokenService, UserClsStore } from "@saas-buildkit/auth";
import { GeneralUnauthorizedException } from "@saas-buildkit/exceptions";

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {
  private readonly logger = new Logger(RefreshJwtAuthGuard.name);

  constructor(
    private tokenService: TokenService,
    private clsService: ClsService<UserClsStore>,
  ) {
    super();
  }

  /**
   * Verify the token is valid
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest(),
    );

    if (!refreshToken) {
      // guards are called before interceptors, that's why general loggers are not available here
      // in normal situation outside of guards such logs are redundant
      this.logger.warn(`No refresh token found for the request,
      it will be rejected by guard and return 401.`);
      throw new GeneralUnauthorizedException();
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    this.clsService.set('tenantId', payload.tenantId);
    this.clsService.set('userId', payload.sub);

    return true;
  }
}
