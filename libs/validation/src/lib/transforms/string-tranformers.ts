import { plainToClass, TransformFnParams } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { IsEnumValidatorDefinition } from '../validators/primitives';
import { validateAndThrow } from '../validators/primitives/utils/validator-definition.utils';

export const trimAndLowercaseTransformer = (
  params: TransformFnParams,
): string | undefined => params.value?.toLowerCase().trim();

export const toInteger = (params: TransformFnParams): number | undefined => {
  const value = params.value;

  if (value === undefined) {
    return undefined;
  }

  return Number.parseInt(value, 10);
};

export const toObjectsArrayFromString = <T>(
  params: TransformFnParams,
  keys: Array<keyof T>,
  constr: ClassConstructor<T>,
  keysValues: string[],
  objectsSeparator = ',',
  valuesSeparator = ':',
) => {
  const value = params.value;

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string') {
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
          keyName.toString(),
          keysValues,
        );

        // eslint-disable-next-line security/detect-object-injection
        acc[keyName] = curr;
        return acc;
      },
      // unknown is used here because we can extend this in future to do a conversion
      {} as Record<keyof T, unknown>,
    );
    return plainToClass(constr, record);
  });
};
