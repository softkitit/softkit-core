import {
  IsStringEnumLocalized,
  toObjectsArrayFromString,
} from '../../../index';
import { ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SampleSort {
  @ValidateNested({
    each: true,
    always: true,
  })
  @Type(() => SortParams)
  @Transform((value) => {
    return toObjectsArrayFromString<SortParams>(
      value,
      ['direction', 'sortValue'],
      SortParams,
      ['direction', 'sortValue'],
    );
  })
  sortParams!: SortParams[];
}

export class SortParams {
  @IsStringEnumLocalized(['A', 'B'])
  direction!: string;

  @IsStringEnumLocalized(['C', 'D'])
  sortValue!: string;
}
