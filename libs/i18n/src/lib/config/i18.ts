import { IsString } from 'class-validator';

export class I18Config {
  @IsString({
    each: true,
  })
  paths!: string[];
}
