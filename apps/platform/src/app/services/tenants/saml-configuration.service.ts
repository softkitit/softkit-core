import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { SAMLConfiguration } from '../../database/entities';
import { SamlConfigurationRepository } from '../../repositories';

import { TenantService } from './tenant.service';
import { BaseTenantEntityService } from '@softkit/typeorm-service';

@Injectable()
export class SamlConfigurationService extends BaseTenantEntityService<
  SAMLConfiguration,
  SamlConfigurationRepository
> {
  constructor(
    samlConfigurationService: SamlConfigurationRepository,
    private readonly samlBaseRepository: SamlConfigurationRepository,
    private readonly tenantService: TenantService,
  ) {
    super(samlConfigurationService);
  }

  @Transactional()
  async findSamlConfig(tenantUrl: string) {
    const tenantId = await this.tenantService.findTenantIdByUrl(tenantUrl);

    if (tenantId) {
      const samlConfig = await this.samlBaseRepository.findOne({
        where: {
          tenantId,
        },
        select: ['entryPoint', 'certificate'],
      });

      if (samlConfig) {
        return {
          entryPoint: samlConfig.entryPoint,
          certificate: samlConfig.certificate,
        };
      }
    }
  }
}
