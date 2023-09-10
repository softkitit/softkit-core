import { TransformFnParams } from 'class-transformer';
import { validateAndThrow } from '../validators/primitives/utils';
import { MatchesRegexpValidatorDefinition } from '../validators';
import { i18nString } from '../utils';

export const toInteger = (params: TransformFnParams): number | undefined => {
  const value = params.value;

  if (value === undefined) {
    return undefined;
  }

  const constraint = /^-?(?!0\d)\d+$/;

  validateAndThrow(
    MatchesRegexpValidatorDefinition,
    params.key,
    value as string,
    constraint,
    i18nString('validation.INTEGER'),
  );

  return Number.parseInt(value, 10);
};
