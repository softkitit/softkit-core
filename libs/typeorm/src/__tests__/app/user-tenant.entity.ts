import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { BaseTenantEntityHelper } from '../../lib/entity/tenant-entity-helper';
import { TenantEntity } from './tenant.entity';
import { ClsPreset } from '../../lib/subscribers/decorator/cls-preset.decorator';
import { UserAndTenantClsStore } from './cls/user.cls-store';
import { IsNumberLocalized } from '@softkit/validation';
import { Expose } from 'class-transformer';
import { PresetType } from '@softkit/persistence-api';

@Entity()
export class TenantUserEntity extends BaseTenantEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // having it nullable is useful for set password later logic
  @Column({ nullable: true, length: 256 })
  password?: string;

  @Column({ type: String, nullable: false, length: 128 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 128 })
  lastName!: string;

  @Column({ type: Number, nullable: true })
  nullableNumber?: number;

  @Column({ type: String, nullable: true, length: 128 })
  nullableStringField?: string;

  @ClsPreset<UserAndTenantClsStore>({
    clsFieldName: 'userId',
    presetType: PresetType.INSERT,
  })
  @Column({ type: String, nullable: false, length: 128 })
  createdBy!: string;

  @ClsPreset<UserAndTenantClsStore>({
    clsFieldName: 'userId',
    presetType: PresetType.UPDATE,
  })
  @Column({ type: String, nullable: true, length: 128 })
  updatedBy!: string;

  @JoinColumn()
  tenant?: TenantEntity;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
