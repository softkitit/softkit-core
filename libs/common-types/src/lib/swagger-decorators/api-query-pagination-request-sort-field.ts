import { ApiProperty } from '@nestjs/swagger';

export const ApiPropertySortFields = <ENUM_VALUES extends string[]>(
  availableSortFields?: ENUM_VALUES,
) =>
  ApiProperty({
    name: 'sort',
    description: `Sort fields. Format: fieldName:direction:nullsPlace, also possible to avoid nullsPlace and direction, default will be applied. Default direction: DESC, default nullsPlace: LAST. To sort by multiple fields, separate them by comma. Example: "id:ASC:FIRST,createdAt:DESC".
      <h5>Available fields</h5>
      ${availableSortFields?.map((f) => `<li>${f}</li>`).join('\n')}
      `,
    required: false,
    type: 'string',
    default: 'default sorting is by id explicitly',
    example: availableSortFields
      ?.map((field) => `${field}:ASC:FIRST`)
      ?.join(','),
  });
