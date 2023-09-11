import {
  BooleanType,
  IntegerType,
  IsIntegerStringCombinedLocalized,
  IsNumberLocalized,
  IsUUIDLocalized,
} from '../../../index';
import { IsBoolean, IsOptional } from 'class-validator';

export class SampleQueryParam {
  @IsIntegerStringCombinedLocalized()
  page!: number;

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
