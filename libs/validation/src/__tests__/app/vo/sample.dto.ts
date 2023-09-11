import {
  IsBooleanLocalized,
  IsEmailLocalized,
  IsStringCombinedLocalized,
  IsUrlLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '../../../index';
import { Optional } from '@nestjs/common';
import { faker } from '@faker-js/faker';

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

export const DEFAULT_SAMPLE_DTO = {
  email: faker.internet.email().toLowerCase(),
  password: '12345Aa!',
  repeatedPassword: '12345Aa!',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName() + faker.string.alphanumeric(10),
  middleName: faker.person.middleName(),
  someCheckboxValue: faker.datatype.boolean(),
  url: faker.internet.url(),
};
