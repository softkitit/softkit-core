import {
  IntegerType,
  IsBooleanLocalized,
  IsEmailLocalized,
  IsStringCombinedLocalized,
  IsUrlLocalized,
  MatchesWithProperty,
  PasswordLocalized,
  trimTransformer,
  IsArrayCombinedLocalized,
  ValidateNestedProperty,
} from '../../../index';
import { Optional } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

class NestedConfig {
  @IsStringCombinedLocalized()
  certificate!: string;
}

class NestedConfigNotRequired {
  @IsStringCombinedLocalized()
  certificate!: string;
}

export class SampleDto {
  @IsEmailLocalized()
  email!: string;

  @IsEmailLocalized({
    emailValidationOptions: { each: true },
    maxLengthValidationOptions: {
      each: true,
    },
  })
  emailArray!: string[];

  @IsEmailLocalized({
    trimAndLowercase: false,
  })
  emailWithoutTrimAndLowercase!: string;

  @Transform((value) => {
    return trimTransformer(value);
  })
  trimField!: string;

  @IsInt()
  @Min(18)
  @IntegerType
  age!: number;

  @IsStringCombinedLocalized()
  @PasswordLocalized()
  password!: string;

  @PasswordLocalized()
  @MatchesWithProperty(SampleDto, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsStringCombinedLocalized()
  repeatedPassword!: string;

  @IsStringCombinedLocalized({
    notEmpty: false,
  })
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

  @Optional()
  @IntegerType
  optionalNumber?: number;

  @IsArrayCombinedLocalized({ minLength: 2, maxLength: 4 })
  fileNameArray!: string[];

  @IsArrayCombinedLocalized()
  documentArray?: string[];

  @ValidateNestedProperty({
    classType: NestedConfig,
    validationOptions: { each: true },
  })
  nestedConfig!: NestedConfig;

  @ValidateNestedProperty({
    required: false,
    classType: NestedConfigNotRequired,
  })
  nestedConfigNotRequired!: NestedConfigNotRequired;
}

export const DEFAULT_SAMPLE_DTO: SampleDto = {
  email: faker.internet.email().toLowerCase(),
  emailArray: [
    faker.internet.email().toLowerCase(),
    faker.internet.email().toLowerCase(),
  ],
  emailWithoutTrimAndLowercase: faker.internet.email().toLowerCase(),
  trimField: faker.string.sample(),
  password: '12345Aa!',
  age: 18,
  repeatedPassword: '12345Aa!',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName() + faker.string.alphanumeric(10),
  middleName: faker.person.middleName(),
  someCheckboxValue: faker.datatype.boolean(),
  url: faker.internet.url(),
  fileNameArray: [
    `${faker.person.lastName()}.png`,
    `${faker.person.lastName()}.png`,
  ],
  documentArray: [],
  nestedConfig: { certificate: 'valid-certificate' },
  nestedConfigNotRequired: { certificate: 'valid-certificate' },
};
