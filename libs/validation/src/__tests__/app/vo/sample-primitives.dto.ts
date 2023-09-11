import {
  IsArrayLocalized,
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

  @MatchesRegexpLocalized(/^[a-z]+$/)
  onlyLowercaseCharacters!: string;
}

export const DEFAULT_SAMPLE_PRIMITIVES_DTO = {
  number: faker.number.int(100),
  integer: faker.number.int(100).toString(),
  onlyLowercaseCharacters: faker.string.alpha(10).toLowerCase(),
  date: faker.date.recent().toISOString(),
  arr: [faker.string.uuid(), faker.string.uuid()],
  object: {
    [faker.string.uuid()]: faker.string.uuid(),
  },
  json: JSON.stringify({
    [faker.string.uuid()]: faker.string.uuid(),
  }),
  minTen: 11,
  maxTen: 9,
};
