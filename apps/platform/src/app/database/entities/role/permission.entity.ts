import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionCategory } from './permission-category.entity';
import { BaseEntityHelper } from "@saas-buildkit/typeorm";

@Entity('permissions')
export class Permission extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  description!: string;

  /**
   * action is the identifier of the permission
   * usually it is the name of the permission in lowercase
   * e.g. admin.user.create, admin.user.read, admin.user.update, admin.user.delete
   * ideally it should be short, up to 16-32 characters
   * because default implementation of auth service keep the permissions in a jwt token
   * and jwt token has a limit of 8kb (8192 characters) in size
   * */
  @Column({ type: String, nullable: false, unique: true })
  action!: string;

  @Column({ nullable: false, type: 'uuid' })
  permissionCategoryId!: string;

  @ManyToOne(() => PermissionCategory, {
    eager: false,
  })
  @JoinColumn()
  permissionCategory?: PermissionCategory | null;
}
