import {
  IsArrayLocalized,
  IsArrayMaxSizeLocalized,
  IsArrayMinSizeLocalized,
  IsDateLocalized,
  IsIntegerString,
  IsJSONLocalized,
  IsNumberLocalized,
  IsObjectLocalized,
  MatchesRegexpLocalized,
  MaxLocalized,
  MinLocalized,
} from '../../../lib/validators';
import { faker } from '@faker-js/faker';
import { IsBoolean } from 'class-validator';
import { BooleanType } from '../../../lib/transforms';

export class SamplePrimitivesDto {
  @IsArrayLocalized()
  arr!: string[];

  @IsDateLocalized()
  date!: string;

  @IsJSONLocalized()
  json!: string;

  @MinLocalized(10)
  minTen!: number;

  @MaxLocalized(10)
  maxTen!: number;

  @IsNumberLocalized()
  number!: number;

  @IsObjectLocalized()
  object!: Record<string, unknown>;

  @IsIntegerString()
  integer!: string;

  @BooleanType
  @IsBoolean()
  boolean!: boolean;

  @MatchesRegexpLocalized(/^[a-z]+$/)
  onlyLowercaseCharacters!: string;

  @IsArrayMinSizeLocalized(3)
  arrayMinThree!: string[];

  @IsArrayMaxSizeLocalized(3)
  arrayMaxThree!: string[];
}

export const DEFAULT_SAMPLE_PRIMITIVES_DTO: SamplePrimitivesDto = {
  number: faker.number.int(100),
  integer: faker.number.int(100).toString(),
  onlyLowercaseCharacters: faker.string.alpha(10).toLowerCase(),
  date: faker.date.recent().toISOString(),
  boolean: faker.datatype.boolean(),
  arr: [faker.string.uuid(), faker.string.uuid()],
  object: {
    [faker.string.uuid()]: faker.string.uuid(),
  },
  json: JSON.stringify({
    [faker.string.uuid()]: faker.string.uuid(),
  }),
  minTen: 11,
  maxTen: 9,
  arrayMinThree: [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ],
  arrayMaxThree: [faker.string.uuid(), faker.string.uuid()],
};
