import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTrackedEntityHelper } from '../../lib/entity/entity-helper';

@Entity()
export class TenantEntity extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, unique: true, nullable: true })
  @Index()
  tenantUrl!: string;

  @Column({ type: String, nullable: false, length: 1024 })
  tenantName!: string;
}
