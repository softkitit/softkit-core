import {
  IS_OBJECT,
  isObject,
  IsObject,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n } from '../../utils';

const MESSAGE = 'validation.OBJECT';

export const IsObjectLocalized = (validationOptions: ValidationOptions = {}) =>
  IsObject({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const IsObjectValidatorDefinition = {
  name: IS_OBJECT,
  validator: isObject,
  defaultValidationMessage: MESSAGE,
  decorator: IsObjectLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
