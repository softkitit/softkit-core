import { Injectable } from '@nestjs/common';
import { PermissionCategory } from '../../database/entities';
import { PermissionCategoryRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';

@Injectable()
export class PermissionCategoryService extends BaseEntityService<
  PermissionCategory,
  PermissionCategoryRepository
> {
  constructor(repository: PermissionCategoryRepository) {
    super(repository);
  }
}
