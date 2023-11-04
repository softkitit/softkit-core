import { BaseChildEntity } from './child/base-child.entity';
import { Exclude, Expose } from 'class-transformer';

export class BaseTransformEntity {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  tenantId?: string;

  @Expose()
  number?: number;

  @Expose()
  bool?: boolean;

  @Expose()
  child?: BaseChildEntity;

  @Expose()
  childArr?: BaseChildEntity[];

  @Expose()
  selfReference?: BaseTransformEntity;

  @Exclude()
  password?: string;
}
