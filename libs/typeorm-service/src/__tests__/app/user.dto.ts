import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@softkit/typeorm';
import { Expose } from 'class-transformer';
import { UserEntity } from './user.entity';
import { ExcludeKeys } from '@softkit/common-types';

export class UserDto {
  @Expose()
  private id!: string;
  @Expose()
  private createdAt!: Date;
}

export type CreateUserDTO = ExcludeKeys<
  UserEntity,
  typeof DEFAULT_CREATE_ENTITY_EXCLUDE_LIST
>;
