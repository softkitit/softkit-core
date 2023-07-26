import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { BaseEntityHelper } from '@saas-buildkit/typeorm';

@Entity('permission_categories')
export class PermissionCategory extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  description!: string;

  @OneToMany(
    () => Permission,
    (permission) => permission.permissionCategoryId,
    { eager: false },
  )
  permissions!: Permission[];
}
