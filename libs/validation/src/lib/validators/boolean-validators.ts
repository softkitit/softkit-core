import { applyDecorators } from '@nestjs/common';
import { IsBoolean } from 'class-validator';

export const IsBooleanLocalized = () =>
  applyDecorators(IsBoolean({ message: 'validation.BOOLEAN' }));
