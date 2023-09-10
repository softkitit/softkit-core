import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt } from 'passport-jwt';
import { firstValueFrom, Observable } from 'rxjs';
import { SKIP_AUTH } from '../vo/constants';
import { TokenService } from '../services/token.service';
import { UserClsStore } from '../vo/user-cls-store';
import { GeneralUnauthorizedException } from '@softkit/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private tokenService: TokenService,
    private clsService: ClsService<UserClsStore>,
    private reflector: Reflector,
  ) {
    super();
  }

  /**
   * Verify the token is valid
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // todo memoize
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      return true;
    }

    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest(),
    );

    if (!accessToken) {
      // guards are called before interceptors, that's why general loggers are not available here
      // in normal situation outside of guards such logs are redundant
      this.logger.warn(`No access token found for the request,
      it will be rejected by guard and return 401.`);
      throw new GeneralUnauthorizedException();
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    this.clsService.set('tenantId', payload.tenantId);
    this.clsService.set('userId', payload.sub);

    const result = await super.canActivate(context);

    /* istanbul ignore next */
    return result instanceof Observable ? firstValueFrom(result) : result;
  }
}
