import { IS_UUID, isUUID, IsUUID, ValidationOptions } from 'class-validator';
import { UUIDVersion } from 'class-validator/types/decorator/string/IsUUID';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.UUID';

export const IsUUIDLocalized = (
  opt: UUIDVersion = 4,
  validationOptions: ValidationOptions = {},
) =>
  IsUUID(opt, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const IsUUIDValidatorDefinition = {
  name: IS_UUID,
  validator: isUUID,
  defaultValidationMessage: MESSAGE,
  decorator: IsUUIDLocalized,
} satisfies IValidatorDefinition<string, UUIDVersion>;
