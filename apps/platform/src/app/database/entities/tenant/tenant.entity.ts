import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityHelper } from "@saas-buildkit/typeorm";

@Entity('tenants')
export class Tenant extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, nullable: false })
  @Index({ unique: true, where: '"tenant_url" IS NOT NULL' })
  tenantUrl!: string;

  @Column({ type: String, nullable: false, length: 1024 })
  tenantName!: string;
}
