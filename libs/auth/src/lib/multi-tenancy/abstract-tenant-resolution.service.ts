import { FastifyRequest } from 'fastify';
import { IAccessTokenPayload } from '../vo/payload';

export abstract class AbstractTenantResolutionService {
  public abstract resolveTenantId(
    req: FastifyRequest,
    jwtPayload: IAccessTokenPayload,
  ): Promise<string | undefined>;

  public abstract verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: IAccessTokenPayload,
  ): Promise<boolean>;
}
