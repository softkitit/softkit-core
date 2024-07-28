import { BaseEntity } from './base.entity';

export interface BaseTrackedEntity extends BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
