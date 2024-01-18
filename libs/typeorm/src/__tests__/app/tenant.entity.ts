import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityHelper } from '../../lib/entities/entity-helper';

@Entity()
export class TenantEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, unique: true, nullable: true })
  @Index()
  tenantUrl!: string;

  @Column({ type: String, nullable: false, length: 1024 })
  tenantName!: string;
}
