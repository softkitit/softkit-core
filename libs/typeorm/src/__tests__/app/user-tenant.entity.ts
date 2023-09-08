import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTenantEntityHelper } from '../../lib/entities/tenant-entity-helper';
import { TenantEntity } from './tenant.entity';
import { ClsPreset } from '../../lib/subscribers/decorator/cls-preset.decorator';
import { PresetType } from '../../lib/subscribers/decorator/vo/preset-type';
import { UserAndTenantClsStore } from './cls/user.cls-store';

@Entity()
export class TenantUserEntity extends BaseTenantEntityHelper {
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

  @ClsPreset<UserAndTenantClsStore>({
    clsPropertyFieldName: 'userId',
    presetType: PresetType.INSERT,
  })
  @Column({ type: String, nullable: false, length: 128 })
  createdBy!: string;

  @ClsPreset<UserAndTenantClsStore>({
    clsPropertyFieldName: 'userId',
    presetType: PresetType.UPDATE,
  })
  @Column({ type: String, nullable: true, length: 128 })
  updatedBy!: string;

  @JoinColumn()
  tenant?: TenantEntity | null;
}
