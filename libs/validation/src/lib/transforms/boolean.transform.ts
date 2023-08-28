import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';

export const BooleanTypeTransform = applyDecorators(
  Transform(({ value }) =>
    typeof value === 'boolean' ? value : value === 'true',
  ),
);
