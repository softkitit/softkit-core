import { Expose } from 'class-transformer';

export class BaseChildEntity {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}
