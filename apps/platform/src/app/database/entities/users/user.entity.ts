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
import { UserRole } from '../roles/user-role.entity';

import { Tenant } from '../tenants/tenant.entity';
import { AuthType } from './types/auth-type.enum';
import { UserStatus } from './types/user-status.enum';
import { BaseEntityHelper } from '@softkit/typeorm';

@Entity('users')
export class User extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // For " string | null" we need to use String type.
  // More  info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: false })
  @Index({ unique: true, where: '"deleted_at" IS NOT NULL' })
  email!: string;

  // having it nullable is useful for set password later logic
  // and for the case when we have external users
  @Column({ nullable: true, length: 256 })
  password?: string;

  @Column({ type: String, nullable: false, length: 256 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 256 })
  lastName!: string;

  @ManyToMany(() => UserRole, { cascade: false, eager: false })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: UserRole[];

  @Column({
    type: 'enum',
    enum: UserStatus,
  })
  status!: UserStatus;

  @Column({
    type: 'enum',
    enum: AuthType,
  })
  authType!: AuthType;

  @Column({ nullable: false })
  @Index({ where: '"deleted_at" IS NOT NULL' })
  tenantId!: string;

  @ManyToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant | null;
}
