import { ArrayNotEmpty, IsString } from 'class-validator';

export class I18Config {
  @IsString({
    each: true,
  })
  @ArrayNotEmpty()
  paths!: string[];
}
