import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApprovalType } from './types/approval-type.enum';

import { User } from './user.entity';
import { BaseEntityHelper } from '@softkit/typeorm';

/**
 * E xternal approval entity.
 * Used for external approval of user email or phone number or whatever else is required approval
 * you can use or do not use the code field, it's up to you
 * for email approval id is enough
 * for phone number approval you can use code field
 * for other cases you can use both id and code fields depending on your needs
 * */
@Entity('external_approvals')
export class ExternalApproval extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  @Index({ where: '"deleted_at" IS NOT NULL' })
  userId!: string;

  @Column({ nullable: false, length: 128 })
  code!: string;

  @Column({
    type: 'enum',
    enum: ApprovalType,
    nullable: false,
  })
  approvalType!: ApprovalType;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn()
  user?: User;
}
