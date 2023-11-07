import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalType } from './types/approval-type.enum';

import { UserProfile } from './user-profile.entity';
import { BaseEntityHelper } from '@softkit/typeorm';
import {
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@softkit/validation';
import { Expose } from 'class-transformer';

/**
 * External approval entity.
 * Used for external approval of user email or phone number or whatever else is required approval
 * you can use or do not use the code field, it's up to you
 * for email approval id is enough
 * for phone number approval you can use code field
 * for other cases you can use both id and code fields depends on your needs
 * */
@Entity('external_approvals')
export class ExternalApproval extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ nullable: false })
  @Index()
  @Expose()
  @IsUUIDLocalized()
  userId!: string;

  @Expose()
  @Column({ nullable: false, length: 128 })
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 128 })
  code!: string;

  @Column({
    type: 'enum',
    enum: ApprovalType,
    nullable: false,
  })
  @IsStringEnumLocalized(ApprovalType)
  approvalType!: ApprovalType;

  @ManyToOne(() => UserProfile, {
    eager: true,
  })
  @JoinColumn()
  user: UserProfile;
}
