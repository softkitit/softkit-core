import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tenant } from './tenant.entity';
import { BaseTenantEntityHelper } from '@softkit/typeorm';

@Entity('saml_configuration')
export class SAMLConfiguration extends BaseTenantEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, nullable: false, length: 2048 })
  entryPoint!: string;

  @Column({ type: String, nullable: false, length: 8192 })
  certificate!: string;

  @Column({ type: Boolean, nullable: false })
  enabled!: boolean;

  @OneToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
