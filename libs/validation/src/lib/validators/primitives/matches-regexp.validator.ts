import { MATCHES, Matches, matches, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from './validator-definition.interface';
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
  validator: (value: string, pattern: RegExp) => matches(value, pattern),
  defaultValidationMessage: MESSAGE,
  decorator: MatchesRegexpLocalized,
} satisfies IValidatorDefinition<string, RegExp>;
