import { Injectable } from '@nestjs/common';
import { UserRole } from '../../database/entities';
import { UserRoleTenantRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';

@Injectable()
export class UserRoleTenantService extends BaseEntityService<
  UserRole,
  UserRoleTenantRepository
> {
  constructor(repository: UserRoleTenantRepository) {
    super(repository);
  }
}
