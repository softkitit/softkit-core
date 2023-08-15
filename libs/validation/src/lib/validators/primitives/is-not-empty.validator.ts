import {
  IS_NOT_EMPTY,
  isNotEmpty,
  IsNotEmpty,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';

const MESSAGE = 'common.validation.REQUIRED_NOT_EMPTY';

export const IsNotEmptyLocalized = (
  validationOptions: ValidationOptions = {},
) =>
  IsNotEmpty({
    message: MESSAGE,
    ...validationOptions,
  });

export const IsNotEmptyValidatorDefinition = {
  name: IS_NOT_EMPTY,
  validator: isNotEmpty,
  defaultValidationMessage: MESSAGE,
  decorator: IsNotEmptyLocalized,
} satisfies IValidatorDefinition<string, undefined>;
