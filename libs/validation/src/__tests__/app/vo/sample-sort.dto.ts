import {
  IsStringEnumLocalized,
  toObjectsArrayFromString,
} from '../../../index';
import { ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { NotEmptyArrayLocalized } from '../../../lib/validators';

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
  @NotEmptyArrayLocalized()
  sortParams!: SortParams[];
}

export class SortParams {
  @IsStringEnumLocalized(['A', 'B'])
  @Expose()
  direction!: string;

  @IsStringEnumLocalized(['C', 'D'])
  @Expose()
  sortValue!: string;
}
