import { Injectable } from '@nestjs/common';
import { CustomUserRole } from '../../database/entities';
import { CustomUserRoleTenantRepository } from '../../repositories';
import { BaseTenantEntityService } from '@saas-buildkit/typeorm-service';

@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<
  CustomUserRole,
  CustomUserRoleTenantRepository
> {
  constructor(repository: CustomUserRoleTenantRepository) {
    super(repository);
  }
}
