import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTrackedEntityHelper } from '@softkit/typeorm';
import { Expose } from 'class-transformer';
import {
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';
import { TenantStatus } from './vo/tenant-status.enum';

@Entity('tenants')
export class TenantEntity extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, nullable: false, length: 127 })
  @Index({ unique: true })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  tenantFriendlyIdentifier!: string;

  @Column({ type: String, nullable: false, length: 127 })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  tenantName!: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: TenantStatus,
    nullable: false,
  })
  @IsStringEnumLocalized(TenantStatus)
  tenantStatus!: TenantStatus;

  @Column({ type: String, nullable: false })
  @Expose()
  @IsUUIDLocalized()
  ownerId!: string;
}
