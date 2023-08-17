import { TransformFnParams } from 'class-transformer';
import { validateAndThrow } from '../validators/primitives/utils';
import { MatchesRegexpValidatorDefinition } from '../validators/primitives/';

export const toIntegerTransformer = (
  params: TransformFnParams,
): number | undefined => {
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
    'common.validation.NOT_INTEGER',
  );

  return Number.parseInt(value, 10);
};
