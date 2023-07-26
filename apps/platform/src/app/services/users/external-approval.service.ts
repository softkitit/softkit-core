import { Injectable } from '@nestjs/common';
import { ExternalApproval } from '../../database/entities';
import { ExternalApprovalsRepository } from '../../repositories';
import { BaseEntityService } from "@saas-buildkit/typeorm-service";

@Injectable()
export class ExternalApprovalService extends BaseEntityService<
  ExternalApproval,
  ExternalApprovalsRepository
> {
  constructor(private readonly usersRepository: ExternalApprovalsRepository) {
    super(usersRepository);
  }
}
