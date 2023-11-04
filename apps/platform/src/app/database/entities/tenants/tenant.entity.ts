import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityHelper } from '@softkit/typeorm';
import { UserTenantAccount } from '../users/user-tenant-account.entity';
import { SAMLConfiguration } from './saml-configuration.entity';
import { UserProfile } from '../users/user-profile.entity';
import { TenantStatus } from './vo/tenant-status.enum';
import { Expose } from 'class-transformer';
import {
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';

@Entity('tenants')
export class Tenant extends BaseEntityHelper {
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

  @OneToOne(() => UserProfile, {
    eager: false,
  })
  @JoinColumn()
  owner?: UserProfile;

  @OneToMany(() => SAMLConfiguration, (config) => config.tenant, {
    eager: false,
  })
  samlConfigurations?: SAMLConfiguration[];

  @OneToMany(() => UserTenantAccount, (tenantUser) => tenantUser.tenant, {
    eager: false,
  })
  tenantUsersAccount?: UserTenantAccount[];
}
