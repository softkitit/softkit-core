import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { JobsOptions } from 'bullmq';
import { IsUUIDLocalized } from '@softkit/validation';
import { BaseTrackedEntityHelper } from '@softkit/typeorm';

export class BaseJobVersion extends BaseTrackedEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Expose()
  @Column({ type: String, nullable: false })
  jobDefinitionId!: string;

  @Expose()
  @Column({ type: 'int', nullable: false })
  jobVersion!: number;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobData?: object;

  @Expose()
  @Column('jsonb', { nullable: true })
  jobOptions?: JobsOptions;
}
