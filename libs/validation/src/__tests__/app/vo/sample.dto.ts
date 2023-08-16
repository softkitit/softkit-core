import {
  IsBooleanLocalized,
  IsEmailLocalized,
  IsStringCombinedLocalized,
  IsUrlLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '../../../index';
import { Optional } from '@nestjs/common';

export class SampleDto {
  @IsEmailLocalized()
  email!: string;

  @IsStringCombinedLocalized()
  @PasswordLocalized()
  password!: string;

  @PasswordLocalized()
  @MatchesWithProperty(SampleDto, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsStringCombinedLocalized()
  repeatedPassword!: string;

  @IsStringCombinedLocalized()
  firstName!: string;

  @IsStringCombinedLocalized({
    minLength: 10,
  })
  lastName!: string;

  @IsStringCombinedLocalized({
    minLength: 0,
    maxLength: 100,
  })
  middleName!: string;

  @IsBooleanLocalized()
  someCheckboxValue!: boolean;

  @IsUrlLocalized()
  url!: string;

  @Optional()
  optionalField?: string;
}
