import { Injectable } from '@nestjs/common';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { AuthConfig } from '../config/auth';
import { FastifyRequest } from 'fastify';
import { IJwtPayload } from '../vo/payload';

@Injectable()
export class JwtPayloadTenantResolutionService extends AbstractTenantResolutionService {
  constructor(private config: AuthConfig) {
    super();
  }

  public override async resolveTenantId(
    _: FastifyRequest,
    jwtPayload: IJwtPayload,
  ): Promise<string | undefined> {
    return (jwtPayload as never)[this.config.currentTenantJwtPayloadKey];
  }

  /**
   * if tenant id is coming from payload it is verified
   * */
  public override async verifyUserBelongToTenant(): Promise<boolean> {
    return true;
  }
}
