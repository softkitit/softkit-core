import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { Tenant, UserProfile } from '../../database/entities';
import { TenantsRepository } from '../../repositories';

import { UserRoleService } from '../roles/user-role.service';
import { BaseEntityService } from '@softkit/typeorm-service';
import { SamlConfig } from '../../config/saml.config';
import { ConflictEntityCreationException } from '@softkit/exceptions';
import { TenantStatus } from '../../database/entities/tenants/vo/tenant-status.enum';

@Injectable()
export class TenantService extends BaseEntityService<
  Tenant,
  TenantsRepository
> {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly samlConfig: SamlConfig,
    private customUserRoleService: UserRoleService,
    tenantsRepository: TenantsRepository,
  ) {
    super(tenantsRepository);
  }

  async findTenantIdByIdentifier(tenantFriendlyIdentifier: string) {
    return await this.findOne({
      where: {
        tenantFriendlyIdentifier,
      },
      select: ['id'],
    }).then((tenant) => tenant?.id);
  }

  @Transactional()
  async setupTenant(
    tenantName: string,
    tenantFriendlyIdentifier: string,
    owner: UserProfile,
  ) {
    const numberOfTenantsByIdentifier = await this.repository.count({
      where: {
        tenantFriendlyIdentifier,
      },
    });

    if (numberOfTenantsByIdentifier > 0) {
      throw new ConflictEntityCreationException(
        'Tenant',
        'tenantFriendlyIdentifier',
        tenantFriendlyIdentifier,
      );
    }

    const tenant = await this.repository.createOrUpdate({
      tenantName,
      tenantFriendlyIdentifier,
      tenantStatus: TenantStatus.ACTIVE,
      owner,
    });

    this.logger.log(`Tenant ${tenantName} created with id ${tenant.id}`);

    return tenant;
  }
}
