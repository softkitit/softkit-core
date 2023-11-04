import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tenant } from './tenant.entity';
import { BaseTenantEntityHelper } from '@softkit/typeorm';
import {
  IsBooleanLocalized,
  IsStringCombinedLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';
import { Expose } from 'class-transformer';

@Entity('saml_configuration')
export class SAMLConfiguration extends BaseTenantEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 2048,
  })
  @Column({ type: String, nullable: false, length: 2048 })
  entryPoint!: string;

  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 16_384,
  })
  @Column({ type: String, nullable: false, length: 16_384 })
  certificate!: string;

  @IsBooleanLocalized()
  @Column({ type: Boolean, nullable: false })
  enabled!: boolean;

  @OneToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
