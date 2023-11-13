import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Permission } from './permission.entity';
import { RoleType } from './types/default-role.enum';
import { BaseEntityHelper, ClsPreset, TenantClsStore } from '@softkit/typeorm';
import { Expose } from 'class-transformer';
import {
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';
import { IsOptional } from 'class-validator';

@Entity('roles')
export class UserRole extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 1024,
  })
  description!: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsStringEnumLocalized(RoleType)
  roleType?: RoleType;

  @ManyToMany(() => Permission, { cascade: true, eager: false })
  @JoinTable({
    name: 'user_roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @Column({ nullable: true })
  @Expose()
  @IsOptional()
  @IsUUIDLocalized()
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  tenantId?: string;

  /**
   * Tenants can have their own roles, but they can also inherit roles from the platform.
   * */
  @ManyToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
