import { MATCHES, Matches, matches, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';

const MESSAGE = 'common.validation.REGEXP';

export const MatchesLocalized = (
  pattern: RegExp,
  validationOptions: ValidationOptions = {},
) =>
  Matches(pattern, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const MatchesValidatorDefinition = {
  name: MATCHES,
  validator: matches,
  defaultValidationMessage: MESSAGE,
  decorator: MatchesLocalized,
} satisfies IValidatorDefinition<string, RegExp>;
