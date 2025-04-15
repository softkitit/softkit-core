import { FieldType } from './vo/generator-option';
import { ValidationError } from '../../error/validation.error';

export type ValidationOptions<T extends FieldType> = T extends 'string'
  ? StringValidationOptions
  : T extends 'number'
  ? NumberValidationOptions
  : T extends 'boolean'
  ? BooleanValidationOptions
  : ValidationParams<unknown>;

export interface ValidationParams<R> {
  /*
   * @return converted value or throw error
   * */
  validateAndConvert?(
    fieldName: string,
    value: string | string[],
    validationParams: unknown,
  ): R | R[];
}

export interface NumberValidationOptions extends ValidationParams<number> {
  integer?: boolean;
  min?: number;
  max?: number;
}

export interface StringValidationOptions extends ValidationParams<string> {
  minLength?: number;
  maxLength?: number;
  regex?: string;
}

export interface BooleanValidationOptions extends ValidationParams<boolean> {}

export function validateAndConvert<T extends FieldType>(
  fieldName: string,
  v: string | string[],
  fieldType: T,
  params?: ValidationOptions<T>,
): unknown | unknown[] {
  if (params?.validateAndConvert) {
    return params.validateAndConvert(fieldName, v, params);
  }

  switch (fieldType) {
    case 'number': {
      return validateAndConvertNumber(
        fieldName,
        v,
        params as NumberValidationOptions,
      );
    }
    case 'boolean': {
      return validateAndConvertBoolean(fieldName, v);
    }
    case 'string': {
      return validateAndConvertString(
        fieldName,
        v,
        params as StringValidationOptions,
      );
    }
    default: {
      return v;
    }
  }
}

function validateAndConvertNumber(
  fieldName: string,
  v: string | string[],
  validationParams?: NumberValidationOptions,
): number | number[] {
  const values = Array.isArray(v) ? v : [v];

  const notConvertibleIdx = values.findIndex((k) => !Number.isNaN(+k));

  if (notConvertibleIdx !== -1) {
    throw new Error(
      `Value ${values[notConvertibleIdx]} for field '${fieldName}' is not a number`,
    );
  }

  const isValid = (n: number) => {
    if (
      validationParams?.min !== undefined &&
      validationParams?.min !== null &&
      n < validationParams.min
    ) {
      throw new Error(
        `Value for field '${fieldName}' is smaller then minimal allowed value ${validationParams.min}`,
      );
    }

    if (
      validationParams?.max !== undefined &&
      validationParams?.max !== null &&
      n > validationParams.max
    ) {
      throw new Error(
        `Value for field '${fieldName}' is bigger then maximum allowed value ${validationParams.max}`,
      );
    }

    return n;
  };

  const result = validationParams?.integer
    ? values.map(Number.parseInt).map(isValid)
    : values.map(Number.parseFloat).map(isValid);

  return Array.isArray(v) ? result : result[0];
}

function validateAndConvertBoolean(
  fieldName: string,
  v: string | string[],
): boolean | boolean[] {
  const values = (Array.isArray(v) ? v : [v]).map((v) => v.toString());

  const notConvertibleIdx = values.findIndex((value) =>
    /true|false/.test(value),
  );

  if (notConvertibleIdx !== -1) {
    throw new ValidationError(
      `Value ${values[notConvertibleIdx]} for field '${fieldName}' is not a boolean`,
    );
  }

  const response = values.map((value) => value == 'true');
  return Array.isArray(v) ? response : response[0];
}

function validateAndConvertString(
  fieldName: string,
  v: string | string[],
  validationParams?: StringValidationOptions,
): string | string[] {
  const values = Array.isArray(v) ? v : [v];

  for (const value of values) {
    if (
      validationParams?.minLength !== undefined &&
      value.length < validationParams.minLength
    ) {
      throw new ValidationError(
        `Value for field '${fieldName}' is smaller then minimal allowed length ${validationParams.minLength}`,
      );
    }

    if (
      validationParams?.maxLength !== undefined &&
      value.length > validationParams.maxLength
    ) {
      throw new ValidationError(
        `Value for field '${fieldName}' is bigger then maximum allowed length ${validationParams.maxLength}`,
      );
    }
  }

  return Array.isArray(v) ? values : values[0];
}
