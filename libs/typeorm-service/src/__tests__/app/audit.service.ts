import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '../../lib/base.service';
import { Transactional } from 'typeorm-transactional';
import { AuditEntity } from './audit.entity';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService extends BaseEntityService<
  AuditEntity,
  AuditRepository
> {
  constructor(auditRepository: AuditRepository) {
    super(auditRepository);
  }

  @Transactional()
  recordAudit(userId: string, action: string, details: string) {
    return this.createOrUpdateEntity({ userId, details, action });
  }

  @Transactional()
  async recordGeneralAction(action: string, details: string) {
    return this.createOrUpdateEntity({ action, details });
  }
}
