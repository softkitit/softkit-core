import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import {
  IsArrayLocalized,
  IsArrayMaxSizeLocalized,
  IsArrayMinSizeLocalized,
} from './primitives';

export interface IsArrayCombinedOptions {
  minLength?: number;
  maxLength?: number;
  options?: ValidatorOptions;
}

export const IsArrayCombinedLocalized = ({
  minLength,
  maxLength,
  options = {},
}: IsArrayCombinedOptions = {}) => {
  const decorators = [
    IsArrayLocalized(options),
    maxLength ? IsArrayMaxSizeLocalized(maxLength, options) : undefined,
    minLength ? IsArrayMinSizeLocalized(minLength, options) : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
