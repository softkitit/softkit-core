import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionCategory } from './permission-category.entity';
import { BaseEntityHelper } from '@softkit/typeorm';
import { Expose } from 'class-transformer';
import {
  IsStringCombinedLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';
import { IsOptional } from 'class-validator';

@Entity('permissions')
export class Permission extends BaseEntityHelper {
  @BeforeUpdate()
  @BeforeInsert()
  public beforeChange() {
    this.action = this.action.toLowerCase();
  }

  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, length: 256, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 256,
  })
  name!: string;

  @Column({ type: String, length: 1024, nullable: true })
  @Expose()
  @IsOptional()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 1024,
  })
  description?: string;

  /**
   * action is the identifier of the permission
   * usually it is the name of the permission in lowercase
   * e.g. ADMIN.USER.CREATE, ADMIN.USER.READ, ADMIN.USER.UPDATE, ADMIN.USER.DELETE, ADMIN.USER.BULK_UPLOAD
   * */
  @Column({ type: String, nullable: false, length: 256 })
  @Index({ unique: true })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 256,
  })
  action!: string;

  @Column({ nullable: false, type: 'uuid' })
  @Expose()
  @IsUUIDLocalized()
  permissionCategoryId!: string;

  @ManyToOne(() => PermissionCategory, {
    eager: false,
  })
  @JoinColumn()
  permissionCategory!: PermissionCategory | null;
}
