import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityHelper } from '@softkit/typeorm';

@Entity('tenants')
export class TenantEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  override id!: string;

  @Column({ type: String, unique: true, nullable: true })
  @Index()
  tenantUrl!: string;

  @Column({ type: String, nullable: false, length: 1024 })
  tenantName!: string;
}
