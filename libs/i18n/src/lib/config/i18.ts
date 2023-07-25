import { IsBoolean } from 'class-validator';

export class I18Config {
  @IsBoolean()
  watch = true;
}
