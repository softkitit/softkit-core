import { Injectable } from '@nestjs/common';
import { SAMLConfiguration } from '../../database/entities';
import { SamlConfigurationRepository } from '../../repositories';

import { BaseTenantEntityService } from '@softkit/typeorm-service';

@Injectable()
export class SamlConfigurationService extends BaseTenantEntityService<
  SAMLConfiguration,
  SamlConfigurationRepository
> {
  constructor(samlConfigurationService: SamlConfigurationRepository) {
    super(samlConfigurationService);
  }
}
