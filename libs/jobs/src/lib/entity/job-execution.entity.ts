import { BaseEntityHelper } from '@softkit/typeorm';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IsStringEnumLocalized, IsUUIDLocalized } from '@softkit/validation';
import { JobsOptions } from 'bullmq';
import { JobStatus } from './vo';
import { Job } from './job.entity';

@Entity('job_executions')
export class JobExecution<JOB_DATA> extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  override id!: string;

  @Expose()
  @Index({ unique: true })
  @Column({ type: String, nullable: false, length: 255 })
  jobName!: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: JobStatus,
    nullable: false,
  })
  @IsStringEnumLocalized(JobStatus)
  jobStatus!: JobStatus;

  @Expose()
  @Column({ type: String, nullable: false })
  jobId!: string;

  @Expose()
  @ManyToOne(() => Job, {
    eager: false,
    cascade: false,
  })
  job?: Job;

  @Expose()
  @Column({ type: String, nullable: false, length: 255 })
  workerId!: string;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobData?: JOB_DATA;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobOptions?: JobsOptions;
}
