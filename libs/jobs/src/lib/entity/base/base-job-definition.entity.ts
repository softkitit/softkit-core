import { BaseEntityHelper } from '@softkit/typeorm';
import { Column, PrimaryColumn } from 'typeorm';
import { Expose } from 'class-transformer';

export abstract class BaseJobDefinitionEntity extends BaseEntityHelper {
  @PrimaryColumn()
  @Expose()
  id!: string;

  @Expose()
  @Column({ type: String, nullable: false, length: 256 })
  jobName!: string;

  @Expose()
  @Column({ type: String, nullable: false, length: 256 })
  queueName!: string;
}
