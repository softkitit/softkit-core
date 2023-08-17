import { TransformFnParams } from 'class-transformer';
import { validateAndThrow } from '../validators/primitives/utils';
import { MatchesRegexpValidatorDefinition } from '../validators/primitives/matches-regexp.validator';

export const toIntegerTransformer = (
  params: TransformFnParams,
): number | undefined => {
  const value = params.value;

  if (value === undefined) {
    return undefined;
  }

  validateAndThrow(
    MatchesRegexpValidatorDefinition,
    params.key,
    value,
    /^-?(?!0\d)\d+$/,
    'common.validation.NOT_INTEGER',
  );

  return Number.parseInt(value, 10);
};
