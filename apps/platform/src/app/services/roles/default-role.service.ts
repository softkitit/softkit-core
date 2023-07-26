import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { DefaultRole } from '../../database/entities';
import { DefaultRoleRepository } from '../../repositories';
import { BaseEntityService } from "@saas-buildkit/typeorm-service";

@Injectable()
export class DefaultRoleService extends BaseEntityService<
  DefaultRole,
  DefaultRoleRepository
> {
  constructor(repository: DefaultRoleRepository) {
    super(repository);
  }

  @Transactional()
  async findAllWithPermissions() {
    return await this.repository.find({
      relations: ['permissions'],
    });
  }
}
