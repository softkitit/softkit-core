import { MATCHES, Matches, matches, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n } from '../../utils';

const MESSAGE = 'validation.REGEXP';

export const MatchesRegexpLocalized = (
  pattern: RegExp,
  validationOptions: ValidationOptions = {},
) =>
  Matches(pattern, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

export const MatchesRegexpValidatorDefinition = {
  name: MATCHES,
  validator: matches,
  defaultValidationMessage: MESSAGE,
  decorator: MatchesRegexpLocalized,
} satisfies IValidatorDefinition<string, RegExp>;
