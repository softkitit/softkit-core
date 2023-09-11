import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { toInteger } from './to-integer.trasformer';

export const IntegerType = applyDecorators(Transform(toInteger));
