import { Injectable, Logger } from '@nestjs/common';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { FastifyRequest } from 'fastify';
import { IAccessTokenSingleTenantPayload } from '../vo/payload';
import { GeneralInternalServerException } from '@softkit/exceptions';

@Injectable()
// eslint-disable-next-line
export class JwtPayloadTenantResolutionService extends AbstractTenantResolutionService<IAccessTokenSingleTenantPayload> {
  private readonly logger: Logger = new Logger(
    JwtPayloadTenantResolutionService.name,
  );

  public override async resolveTenantId(
    _: FastifyRequest,
    jwtPayload?: IAccessTokenSingleTenantPayload,
  ): Promise<string | undefined> {
    // jwt payload usually undefined for not authorized users, so we don't need to resolve tenants
    if (jwtPayload) {
      if (!jwtPayload?.tenantId) {
        this.logger.error(
          `Application is configured to use jwt payload tenant resolution, but tenant id is not in the token, most likely it's some misconfiguration. Require investigation: %o`,
          jwtPayload,
        );
        throw new GeneralInternalServerException();
      }
      return jwtPayload?.tenantId;
    }

    return undefined;
  }

  /**
   * if tenant id is coming from payload it is verified
   * */
  public override async verifyUserBelongToTenant(): Promise<boolean> {
    return true;
  }
}
