import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { Permission } from './permission.entity';
import { RoleType } from './types/default-role.enum';
import { BaseTenantEntityHelper } from '@saas-buildkit/typeorm';

@Entity('custom_roles')
export class CustomUserRole extends BaseTenantEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  description!: string;

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  roleType?: RoleType;

  @ManyToMany(() => Permission, { cascade: false, eager: false })
  @JoinTable({
    name: 'custom_roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @ManyToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
