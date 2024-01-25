import { BaseEntityHelper } from '@softkit/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuditEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  override id!: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: String })
  details!: string;

  @Column({ type: String })
  action!: string;
}
