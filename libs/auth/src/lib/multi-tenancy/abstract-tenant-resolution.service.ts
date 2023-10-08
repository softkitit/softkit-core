import { FastifyRequest } from 'fastify';
import { IJwtPayload } from '../vo/payload';

export abstract class AbstractTenantResolutionService {
  public abstract resolveTenantId(
    req: FastifyRequest,
    jwtPayload: IJwtPayload,
  ): Promise<string | undefined>;

  public abstract verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: IJwtPayload,
  ): Promise<boolean>;
}
