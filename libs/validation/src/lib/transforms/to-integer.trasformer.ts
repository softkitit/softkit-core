import { TransformFnParams } from 'class-transformer';
import { validateAndThrow } from '../validators/dynamic';
import { MatchesRegexpValidatorDefinition } from '../validators';
import { i18nString } from '../utils';

export const toInteger = (params: TransformFnParams): number | undefined => {
  let value = params.value;

  if (value === null || value === undefined) {
    return value;
  }

  const constraint = /^-?(?!0\d)\d+$/;

  /**
   * This is needed because we want to make sure that the value is a string
   * */
  if (typeof value === 'number') {
    value = value.toString();
  }

  validateAndThrow(
    MatchesRegexpValidatorDefinition,
    params.key,
    value as string,
    constraint,
    i18nString('validation.INTEGER'),
  );

  return Number.parseInt(value, 10);
};
