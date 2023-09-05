import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { Tenant } from '../../database/entities';
import { TenantsRepository } from '../../repositories';

import { CustomUserRoleService } from '../roles/custom-user-role.service';
import { BaseEntityService } from '@softkit/typeorm-service';
import { AppConfig } from '@softkit/bootstrap';

@Injectable()
export class TenantService extends BaseEntityService<
  Tenant,
  TenantsRepository
> {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly appConfig: AppConfig,
    private customUserRoleService: CustomUserRoleService,
    tenantsRepository: TenantsRepository,
  ) {
    super(tenantsRepository);
  }

  async findTenantIdByUrl(tenantUrl: string) {
    return await this.findOne({
      where: {
        tenantUrl,
      },
      select: ['id'],
    }).then((tenant) => tenant?.id);
  }

  @Transactional()
  async setupTenant(tenantName: string) {
    const tenantUrl = await this.generateTenantUrlPrefix(tenantName);

    const tenant = await this.repository.save({
      tenantName,
      tenantUrl,
    });

    this.logger.log(`Tenant ${tenantName} created with id ${tenant.id}`);

    return tenant;
  }

  @Transactional()
  private async generateTenantUrlPrefix(tenantName: string) {
    const tenantUrlPrefix = tenantName
      .toLowerCase()
      .replaceAll(/[^\da-z]/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '');

    // todo make this configurable, it's probably not nessaary to be like this
    const tenantUrl = `${tenantUrlPrefix}`;

    const tenantUrlExists = await this.repository.count({
      where: {
        tenantUrl,
      },
    });

    if (tenantUrlExists) {
      this.logger.warn(
        `This finally happened! ${tenantUrlPrefix} repeated, probably someone registered second time or someone with a similar company name`,
      );
      return `${tenantUrlPrefix}-${Math.floor(Date.now() / 1000)}`;
    }

    return tenantUrl;
  }
}
