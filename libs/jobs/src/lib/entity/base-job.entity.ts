import { BaseEntityHelper } from '@softkit/typeorm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { IsUUIDLocalized } from '@softkit/validation';
import { JobsOptions } from 'bullmq';
import { BaseJobData } from '../service/vo';

export abstract class BaseJobEntity<
  JOB_DATA extends BaseJobData,
> extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  override id!: string;

  @Expose()
  @Column({ type: String, nullable: false, length: 256 })
  name!: string;

  @Expose()
  @Column({ type: Number, nullable: false, default: 0 })
  jobVersion!: number;

  @Expose()
  @Column({ type: String, nullable: false, length: 128 })
  pattern?: string;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobData?: JOB_DATA;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobOptions?: JobsOptions;
}
