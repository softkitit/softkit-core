import { ApiProperty } from '@nestjs/swagger';

export const ApiPropertySortFields = <ENUM_VALUES extends string[]>(
  availableSortFields?: ENUM_VALUES,
) =>
  ApiProperty({
    name: 'sort',
    description:
      'Sort fields. Format: fieldName:direction:nullsPlace, also possible to avoid nullsPlace and direction, default will be applied. Default direction: DESC, default nullsPlace: LAST. To sort by multiple fields, separate them by comma. Example: "id:ASC:FIRST,createdAt:DESC"',
    required: false,
    type: 'enum',
    default: '',
    enum: availableSortFields?.map((field) => field),
    example: availableSortFields
      ?.map((field) => `${field}:ASC:FIRST`)
      ?.join(', '),
  });
