import { Injectable } from '@nestjs/common';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { FastifyRequest } from 'fastify';
import { IAccessTokenPayload } from '../vo/payload';

@Injectable()
export class JwtPayloadTenantResolutionService extends AbstractTenantResolutionService {
  constructor() {
    super();
  }

  public override async resolveTenantId(
    _: FastifyRequest,
    jwtPayload: IAccessTokenPayload,
  ): Promise<string | undefined> {
    return (jwtPayload as never)['tenantId'];
  }

  /**
   * if tenant id is coming from payload it is verified
   * */
  public override async verifyUserBelongToTenant(): Promise<boolean> {
    return true;
  }
}
