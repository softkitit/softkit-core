import { Type } from 'class-transformer';

export class UserEntity {
  id!: number;
  name!: string;
  age!: number;
  active!: boolean;
  @Type(() => Date)
  createdAt!: Date;
}
