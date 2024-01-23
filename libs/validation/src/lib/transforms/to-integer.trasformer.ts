import { TransformFnParams } from 'class-transformer';

export const toInteger = (params: TransformFnParams): number | undefined => {
  let value = params.value;

  /* istanbul ignore next */
  if (value === null || value === undefined) {
    return value;
  }

  /**
   * This is needed because we want to make sure that the value is a string
   * */
  if (typeof value === 'number') {
    value = value.toString();
  }

  const constraint = /^-?(?!0\d)\d+$/;

  if (!constraint.test(value.toString())) {
    return;
  }

  return Number.parseInt(value, 10);
};
