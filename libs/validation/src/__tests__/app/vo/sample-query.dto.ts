import {
  BooleanType,
  IntegerType,
  IsIntegerStringCombinedLocalized,
  IsNumberLocalized,
  IsUUIDLocalized,
} from '../../../index';
import { IsBoolean, IsOptional } from 'class-validator';
import { faker } from '@faker-js/faker';

export class SampleQueryParam {
  @IsIntegerStringCombinedLocalized()
  page!: number;

  @IsIntegerStringCombinedLocalized({
    min: 1,
    max: 100,
  })
  size!: number;

  @IsUUIDLocalized()
  uuid!: string;

  @BooleanType
  @IsBoolean()
  bool!: boolean;

  @BooleanType
  @IsBoolean()
  @IsOptional()
  optionalBoolean?: boolean;

  @IntegerType
  @IsNumberLocalized()
  @IsOptional()
  optionalInteger?: number;
}

export const DEFAULT_SAMPLE_QUERY_PARAM = {
  uuid: faker.string.uuid(),
  page: faker.number.int(100).toString(10),
  bool: 'true',
  size: faker.number
    .int({
      min: 1,
      max: 100,
    })
    .toString(),
};
