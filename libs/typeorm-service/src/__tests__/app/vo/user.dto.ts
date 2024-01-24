import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  private id!: string;
  @Expose()
  private createdAt!: Date;
}
