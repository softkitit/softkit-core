import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Permission } from './permission.entity';
import { RoleType } from './types/default-role.enum';
import { BaseEntityHelper } from '@saas-buildkit/typeorm';

@Entity('roles')
export class CustomUserRole extends BaseEntityHelper {
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
    name: 'user_roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  /**
   * @description Tenant Id can be null because we have default permissions for admin and regular user
   * which are not related to any tenant and are not editable
   * */
  @Column({ nullable: true, type: 'uuid' })
  @Index({ where: '"deleted_at" IS NOT NULL' })
  tenantId: string;

  @ManyToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
