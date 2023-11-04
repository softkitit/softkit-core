import { AbstractTenantResolutionService } from '../../../lib/multi-tenancy';
import { IAccessTokenPayload } from '../../../lib/vo/payload';

export class NoOpTenantResolutionService extends AbstractTenantResolutionService<IAccessTokenPayload> {
  override async resolveTenantId(): Promise<string | undefined> {
    return undefined;
  }

  override async verifyUserBelongToTenant(): Promise<boolean> {
    return false;
  }
}
