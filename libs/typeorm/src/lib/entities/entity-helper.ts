import { Expose, instanceToPlain } from 'class-transformer';
import {
  AfterLoad,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumberLocalized } from '@softkit/validation';

export abstract class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}

export abstract class BaseEntityHelper extends EntityHelper {
  @ApiProperty({
    description: 'Unique identifier',
  })
  @Expose()
  id!: string | number;

  @ApiProperty({
    type: Date,
    description: 'Created at date time in ISO format',
  })
  @Expose()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    type: Date,
    description: 'Last time updated at date time in ISO format',
  })
  @Expose()
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    type: Date,
    description: 'Deleted at date time in ISO format',
  })
  @Expose()
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    type: 'string',
    description: 'Entity version for optimistic lock handling',
  })
  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
