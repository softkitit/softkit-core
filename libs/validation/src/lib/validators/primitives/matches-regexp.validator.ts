import { MATCHES, Matches, matches, ValidationOptions } from 'class-validator';
import { i18nValidationMessage } from '@saas-buildkit/nestjs-i18n';
import { IValidatorDefinition } from './validator-definition.interface';

const MESSAGE = 'common.validation.REGEXP';

export const MatchesRegexpLocalized = (
  pattern: RegExp,
  validationOptions: ValidationOptions = {},
) =>
  Matches(pattern, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

export const MatchesRegexpValidatorDefinition = {
  name: MATCHES,
  validator: matches,
  defaultValidationMessage: MESSAGE,
  decorator: MatchesRegexpLocalized,
} satisfies IValidatorDefinition<string, RegExp>;
