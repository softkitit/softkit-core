import { IsBoolean } from 'class-validator';

export default class I18Config {
  @IsBoolean()
  watch = true;
}
