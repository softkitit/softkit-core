import { FieldType } from './generator-option';

export interface ValidationParams {
  /**
   * default true
   * */
  required?: boolean;

  /*
   * @return converted value or throw error
   * */
  validateAndConvert?(
    fieldName: string,
    value: string | string[],
    validationParams: unknown,
  ): unknown;
}

export interface NumberValidationParams extends ValidationParams {
  type: 'number';
  integer?: boolean;
  min?: number;
  max?: number;
}

export interface StringValidationParams extends ValidationParams {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  regex?: number;
}

export interface BooleanValidationParams extends ValidationParams {
  type: 'boolean';
}

export function validateAndConvert(
  fieldName: string,
  v: string | string[],
  fieldType?: FieldType,
  validationParams?: ValidationParams,
): unknown {
  if (validationParams?.validateAndConvert) {
    return validationParams.validateAndConvert(fieldName, v, validationParams);
  }

  if (fieldType === 'number') {
    return validateAndConvertNumber(
      fieldName,
      v,
      validationParams as NumberValidationParams,
    );
  }

  if (fieldType === 'boolean') {
    return validateAndConvertBoolean(fieldName, v);
  }

  if (fieldType === 'string') {
    return validateAndConvertString(
      fieldName,
      v,
      validationParams as StringValidationParams,
    );
  }

  return v;
}

function validateAndConvertNumber(
  fieldName: string,
  v: string | string[],
  validationParams?: NumberValidationParams,
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
    throw new Error(
      `Value ${values[notConvertibleIdx]} for field '${fieldName}' is not a boolean`,
    );
  }

  const response = values.map((value) => value == 'true');
  return Array.isArray(v) ? response : response[0];
}

function validateAndConvertString(
  fieldName: string,
  v: string | string[],
  validationParams?: StringValidationParams,
): string | string[] {
  const values = Array.isArray(v) ? v : [v];

  for (const value of values) {
    if (
      validationParams?.minLength !== undefined &&
      value.length < validationParams.minLength
    ) {
      throw new Error(
        `Value for field '${fieldName}' is smaller then minimal allowed length ${validationParams.minLength}`,
      );
    }

    if (
      validationParams?.maxLength !== undefined &&
      value.length > validationParams.maxLength
    ) {
      throw new Error(
        `Value for field '${fieldName}' is bigger then maximum allowed length ${validationParams.maxLength}`,
      );
    }
  }

  return Array.isArray(v) ? values : values[0];
}
