import { BaseTrackedEntityHelper } from '@softkit/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuditEntity extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: String })
  details!: string;

  @Column({ type: String })
  action!: string;
}
