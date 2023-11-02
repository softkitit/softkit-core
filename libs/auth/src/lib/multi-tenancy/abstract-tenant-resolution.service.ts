import { FastifyRequest } from 'fastify';
import { IAccessTokenPayload } from '../vo/payload';

export abstract class AbstractTenantResolutionService {
  /**
   * jwt payload is optional because it can be undefined in cases where the auth is not needed
   * */
  public abstract resolveTenantId(
    req: FastifyRequest,
    jwtPayload?: IAccessTokenPayload,
  ): Promise<string | undefined>;

  /**
   * verify user belong to tenant works only for authorized users
   * */
  public abstract verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: IAccessTokenPayload,
  ): Promise<boolean>;
}
