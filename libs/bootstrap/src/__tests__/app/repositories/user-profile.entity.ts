import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { BaseTrackedEntityHelper } from '@softkit/typeorm';
import {
  IsEmailLocalized,
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
  PasswordLocalized,
} from '@softkit/validation';
import { Expose } from 'class-transformer';
import { UserProfileStatus } from './vo/user-profile-status.enum';

@Entity('user_profile')
export class UserProfile extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, unique: true, nullable: false, length: 320 })
  @Index({ unique: true })
  @Expose()
  @IsEmailLocalized()
  email!: string;

  @Column({ nullable: true, length: 256 })
  @Expose()
  @PasswordLocalized()
  password?: string;

  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserProfileStatus,
  })
  @Expose()
  @IsStringEnumLocalized(UserProfileStatus)
  status!: UserProfileStatus;
}
