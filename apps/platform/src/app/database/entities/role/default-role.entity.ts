import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RoleType } from './types/default-role.enum';
import { BaseEntityHelper } from "@saas-buildkit/typeorm";

/**
 * this entity is responsible for keeping default roles for users
 * data from this entity will be used to create default roles for tenants
 * it's important to maintain this entity in sync with tenant roles
 * this entity is not tenant aware
 * */
@Entity('default_roles')
export class DefaultRole extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  description!: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true,
  })
  roleType!: RoleType;

  @ManyToMany(() => Permission, { cascade: false })
  @JoinTable({
    name: 'default_roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];
}
