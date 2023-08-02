import { plainToClass, TransformFnParams } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export const lowerCaseTransformer = (
  params: TransformFnParams,
): string | undefined => params.value?.toLowerCase().trim();

export const toInteger = (params: TransformFnParams): number | undefined => {
  const value = params.value;

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.length === 0) {
    // todo replace with custom exception
    throw new BadRequestException('common.validation.INTEGER');
  }

  // Check if the value is a valid integer
  if (/^-?(?!0\d)\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  } else {
    // todo replace with custom exception
    throw new BadRequestException('common.validation.INTEGER');
  }
};

export const toObjectsArrayFromString = <T>(
  params: TransformFnParams,
  keys: Array<keyof T>,
  constr: ClassConstructor<T>,
  keysValues?: string[],
  objectsSeparator = ',',
  valuesSeparator = ':',
) => {
  const value = params.value;

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string' || value.length === 0) {
    // todo replace with custom exception
    throw new BadRequestException('common.validation.DOESNT_MATCH_FORMAT');
  }

  return value.split(objectsSeparator).map((v) => {
    const values = v.split(valuesSeparator);

    if (values.length !== keys.length) {
      // todo replace with custom exception
      throw new BadRequestException('common.validation.DOESNT_MATCH_FORMAT');
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    const record = values.reduce(
      (acc, curr, index) => {
        // eslint-disable-next-line security/detect-object-injection
        const keyName = keys[index];

        if (
          keysValues !== undefined &&
          !keysValues.includes(keyName.toString())
        ) {
          throw new BadRequestException('common.validation.STRING_ENUM');
        }

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
