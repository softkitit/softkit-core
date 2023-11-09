import { TransformFnParams } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { validateAndThrow } from '../validators/dynamic';
import { IsEnumValidatorDefinition } from '../validators';
import { map } from '../mapping';

export const toObjectsArrayFromString = <T>(
  params: TransformFnParams,
  keys: Array<keyof T>,
  constr: ClassConstructor<T>,
  keysValues: string[],
  objectsSeparator = ',',
  valuesSeparator = ':',
) => {
  const value = params.value;

  /* istanbul ignore next */
  if (value === undefined) {
    /**
     * there is no real circumstance where this would happen, because it used for query params
     * and if there is no query params class-validator not invoking this
     */
    /* istanbul ignore next */
    return;
  }

  /* istanbul ignore next */
  if (typeof value !== 'string') {
    /**
     * there is no real circumstance where this would happen, because it used for query params
     */
    return {};
  }

  return value.split(objectsSeparator).map((v) => {
    const values = v.split(valuesSeparator);

    // eslint-disable-next-line unicorn/no-array-reduce
    const record = values.reduce(
      (acc, curr, index) => {
        // eslint-disable-next-line security/detect-object-injection
        const keyName = keys[index];

        validateAndThrow(
          IsEnumValidatorDefinition,
          params.key,
          keyName?.toString(),
          keysValues,
        );

        // eslint-disable-next-line security/detect-object-injection
        acc[keyName] = curr;
        return acc;
      },
      // unknown is used here because we can extend this in future to do a conversion
      {} as Record<keyof T, unknown>,
    );
    return map(record, constr);
  });
};
