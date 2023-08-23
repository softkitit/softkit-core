import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTenantEntityHelper } from '../../lib/entities/tenant-entity-helper';
import { TenantEntity } from './tenant.entity';

@Entity()
export class TestTenantBaseEntity extends BaseTenantEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  override id!: string;

  // having it nullable is useful for set password later logic
  @Column({ nullable: true, length: 256 })
  password?: string;

  @Column({ type: String, nullable: false, length: 128 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 128 })
  lastName!: string;

  @Column({ type: Number, nullable: true })
  sampleNumber?: number;

  @Column({ type: String, nullable: true, length: 128 })
  nullableStringField?: string | null;

  @JoinColumn()
  tenant?: TenantEntity | null;
}
