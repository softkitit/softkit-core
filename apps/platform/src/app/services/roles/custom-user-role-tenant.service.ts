import { Injectable } from '@nestjs/common';
import { UserRole } from '../../database/entities';
import { UserRoleTenantRepository } from '../../repositories';
import { BaseTenantEntityService } from '@softkit/typeorm-service';

@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<
  UserRole,
  UserRoleTenantRepository
> {
  constructor(repository: UserRoleTenantRepository) {
    super(repository);
  }
}
