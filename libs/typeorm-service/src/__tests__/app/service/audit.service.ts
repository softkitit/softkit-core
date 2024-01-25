import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '../../../lib/base.service';
import { Transactional } from 'typeorm-transactional';
import { AuditEntity } from '../entity/audit.entity';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class AuditService extends BaseEntityService<
  AuditEntity,
  'id',
  AuditRepository,
  Pick<AuditEntity, 'id'>
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
