import { Injectable } from '@nestjs/common';
import { Permission } from '../../database/entities';
import { PermissionRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';

@Injectable()
export class PermissionService extends BaseEntityService<
  Permission,
  PermissionRepository
> {
  constructor(repository: PermissionRepository) {
    super(repository);
  }
}
