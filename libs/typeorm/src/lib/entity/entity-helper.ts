import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity as Base,
  BaseTrackedEntity,
} from '@softkit/persistence-api';
import { Expose } from 'class-transformer';

export abstract class EntityHelper extends BaseEntity implements Base {}

export abstract class BaseTrackedEntityHelper
  extends EntityHelper
  implements BaseTrackedEntity
{
  @ApiProperty({
    type: Date,
    description: 'Created at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    type: Date,
    description: 'Last time updated at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    type: Date,
    description: 'Deleted at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
