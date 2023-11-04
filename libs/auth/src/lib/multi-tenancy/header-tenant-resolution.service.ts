import { Injectable, Logger } from '@nestjs/common';
import { AuthConfig } from '../config/auth';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { FastifyRequest } from 'fastify';
import { IAccessTokenPayloadWithTenantsInfo } from '../vo/payload';
import { GeneralForbiddenException } from '@softkit/exceptions';

@Injectable()
export class HeaderTenantResolutionService extends AbstractTenantResolutionService<IAccessTokenPayloadWithTenantsInfo> {
  private readonly logger = new Logger(HeaderTenantResolutionService.name);

  constructor(private config: AuthConfig) {
    super();
  }

  public override async resolveTenantId(
    req: FastifyRequest,
  ): Promise<string | undefined> {
    return req.headers[this.config.headerTenantId]?.toString();
  }

  /**
   * By default, we rely on the jwt payload to verify the user belongs to the tenant.
   * */
  override async verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: IAccessTokenPayloadWithTenantsInfo,
  ): Promise<boolean> {
    const tenantInfo = (jwtPayload.tenants || []).find(
      (t) => t.tenantId === tenantId,
    );

    if (tenantInfo) {
      return true;
    } else {
      this.logger.error(
        `
        Cross tenant request detected, that is suspicious,
        and it's better to investigate it. Tenant: %s, payload: %s
        `,
        tenantId,
        jwtPayload,
      );
      throw new GeneralForbiddenException();
    }
  }
}
