import { IS_ENUM, IsEnum, isEnum, ValidationOptions } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.STRING_ENUM';

export const IsStringEnumLocalized = (
  enumType: object | string[],
  validationOptions: ValidationOptions = {},
) => {
  return applyDecorators(
    IsEnum(enumType, {
      message: i18nValidationMessage(MESSAGE),
      ...validationOptions,
    }),
  );
};

export const IsEnumValidatorDefinition = {
  name: IS_ENUM,
  validator: isEnum,
  defaultValidationMessage: MESSAGE,
  decorator: IsStringEnumLocalized,
} satisfies IValidatorDefinition<unknown, object>;
