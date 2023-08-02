import { ApiProperty } from '@nestjs/swagger';
import {
  IsIntegerStringLocalized,
  IsStringEnumLocalized,
  toObjectsArrayFromString,
} from '@saas-buildkit/validation';
import { ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import { ApiPropertySortFields } from '../swagger-decorators';
import { applyDecorators } from '@nestjs/common';

export class InfinityPaginationResultType<T> {
  @ApiProperty({ isArray: true, required: true })
  data!: T[];

  @ApiProperty({
    description: 'Showing is there next page or not',
    required: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Showing count of available entities',
    required: true,
  })
  count!: number;
}

export class PaginationQueryParams {
  @ApiProperty({
    description:
      'Page number to be returned. Starts from 0. If not provided, default value is 0',
    required: false,
    default: 0,
    minimum: 0,
    type: Number,
  })
  @IsIntegerStringLocalized({
    min: 0,
  })
  page = 0;

  @ApiProperty({
    description:
      'Page size to be returned. If not provided, default value is 20',
    required: false,
    minimum: 1,
    default: 20,
    maximum: 100,
    type: Number,
  })
  @IsIntegerStringLocalized({
    min: 1,
    max: 100,
  })
  size = 20;

  @ValidateNested({
    each: true,
  })
  sort: Sort[] = [];

  toTypeOrmSortParams() {
    if (!this.sort || this.sort?.length === 0) {
      return {};
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    return this.sort.reduce(
      (acc, sort) => {
        acc[sort.key] = {
          direction: sort.direction,
          nulls: sort.nullsPlace,
        };
        return acc;
      },
      {} as Record<string, { direction: string; nulls: string }>,
    );
  }
}

export function DefaultSortTransformAndApi(fields?: string[]) {
  return applyDecorators(
    Transform((value: TransformFnParams) => {
      return toObjectsArrayFromString<Sort>(
        value,
        ['key', 'direction', 'nullsPlace'],
        Sort,
        fields,
      );
    }),
    ApiPropertySortFields(fields),
  );
}

export enum SortDirection {
  'ASC' = 'ASC',
  'DESC' = 'DESC',
}

export enum NullsPlace {
  'FIRST' = 'FIRST',
  'LAST' = 'LAST',
}

export class Sort {
  @ApiProperty({
    description: 'Field name to sort by',
    required: true,
    type: String,
  })
  key!: string;

  @ApiProperty({
    enum: SortDirection,
    description: 'Sort direction for field',
    required: false,
    default: SortDirection.DESC,
  })
  @IsStringEnumLocalized(SortDirection)
  direction: SortDirection = SortDirection.DESC;

  @ApiProperty({
    enum: NullsPlace,
    description: 'Sort nulls for field',
    required: false,
    default: NullsPlace.LAST,
  })
  @IsStringEnumLocalized(NullsPlace)
  nullsPlace: NullsPlace = NullsPlace.LAST;
}
