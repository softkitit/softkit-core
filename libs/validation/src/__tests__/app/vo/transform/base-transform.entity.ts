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

export const BASE_TRANSFORM_ENTITY: BaseTransformEntity = {
  id: 'id',
  name: 'name',
  description: 'description',
  tenantId: 'tenantId',
  number: 1,
  bool: true,
  child: {
    id: 'id',
    name: 'name',
  },
  childArr: [
    {
      id: 'id',
      name: 'name',
    },
  ],
  password: 'password',
};
