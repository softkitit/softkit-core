import { Injectable } from '@nestjs/common';
import { BaseTrackedEntityService } from '../../../lib/base-tracked-entity.service';
import { Transactional } from 'typeorm-transactional';
import { AuditEntity } from '../entity/audit.entity';
import { AuditRepository } from '../repository/audit.repository';
import { BaseTrackedEntityHelper } from '@softkit/typeorm';

@Injectable()
export class AuditService extends BaseTrackedEntityService<
  AuditEntity,
  'id',
  AuditRepository,
  'id',
  keyof BaseTrackedEntityHelper | 'id'
> {
  constructor(auditRepository: AuditRepository) {
    super(auditRepository);
  }

  @Transactional()
  recordAudit(userId: string, action: string, details: string) {
    return this.upsert({ userId, details, action });
  }

  @Transactional()
  async recordGeneralAction(action: string, details: string) {
    return this.upsert({ action, details });
  }
}
