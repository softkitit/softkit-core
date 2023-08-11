import { plainToClass, TransformFnParams } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

import { I18nValidationException } from 'nestjs-i18n/dist/interfaces/i18n-validation-error.interface';
import { IS_ENUM, isEnum, ValidationError } from 'class-validator';
import {
  Condition,
  ConditionsArray,
  doesConditionMatchOperation,
  ManyValuesCondition,
  NoValueCondition,
  OneValueCondition,
  WHERE_OPERATIONS_UTILS,
  WhereOperation,
  WhereOperationTransformer,
} from '../types/query.type';

function retrieveValuesForValidationAndInstance<OBJECT_TYPE>(
  cnd: Condition<
    OBJECT_TYPE,
    keyof OBJECT_TYPE extends string
      ? Extract<keyof OBJECT_TYPE, string>
      : never
  >,
): {
  values: unknown[];
  instance: Condition<
    OBJECT_TYPE,
    keyof OBJECT_TYPE extends string
      ? Extract<keyof OBJECT_TYPE, string>
      : never
  >;
} {
  if ('value' in cnd) {
    return {
      values: [cnd.value],
      instance: plainToClass(OneValueCondition, cnd),
    };
  } else if ('values' in cnd) {
    const values = cnd.values;

    return {
      values: values as [],
      instance: plainToClass(ManyValuesCondition, cnd),
    };
  } else if ('field' in cnd && 'op' in cnd) {
    return {
      values: [],
      instance: plainToClass(
        NoValueCondition,
        cnd,
      ) as unknown as NoValueCondition<Extract<keyof OBJECT_TYPE, string>>,
    };
  } else {
    // todo fix exception
    throw new BadRequestException(
      'common.validation.INTERNAL_SHOULD_BE_OBJECT',
    );
  }
}

function buildValidationError(
  value: unknown,
  fieldName: string,
  validator: {
    validator: (any: unknown) => boolean;
    validatorName: string;
    constraints?: unknown[];
    errorMessage: string;
  },
) {
  const validationError = new ValidationError();
  validationError.value = value;
  validationError.property = fieldName;
  validationError.constraints = {
    [validator.validatorName]: validator.errorMessage,
  };
  return validationError;
}

function validateValues<OBJECT_TYPE>(
  valuesParsed: {
    values: unknown[];
    instance: Condition<
      OBJECT_TYPE,
      keyof OBJECT_TYPE extends string
        ? Extract<keyof OBJECT_TYPE, string>
        : never
    >;
  },
  validators: {
    validator: (any: unknown) => boolean;
    validatorName: string;
    constraints?: unknown[];
    errorMessage: string;
  }[],
  fieldName: string,
) {
  return valuesParsed.values.flatMap((value) => {
    //   validate each value using validators
    //   if any of them is invalid throw exception
    return validators
      .map((validator) => {
        const valid = validator.validator(value);

        if (!valid) {
          return buildValidationError(value, fieldName, validator);
        }
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      })
      .filter((error): error is ValidationError => error !== undefined);
  });
}

// eslint-disable-next-line complexity
export const buildWhereConditionFromQueryParams = <OBJECT_TYPE extends object>(
  params: TransformFnParams,
  fieldsValidatorsDefinitions: {
    [key in Extract<keyof OBJECT_TYPE, string>]: {
      validator: (any: unknown) => boolean;
      validatorName: string;
      constraints?: unknown[];
      errorMessage: string;
    }[];
  },
): ConditionsArray<OBJECT_TYPE> => {
  const value = params.value;

  if (value === undefined || value === '') {
    return [];
  }

  const whereConditionsParsed = JSON.parse(value);

  if (!Array.isArray(whereConditionsParsed)) {
    // todo replace with custom exception
    throw new BadRequestException('common.validation.SHOULD_BE_ARRAY');
  }

  if (whereConditionsParsed.length === 0) {
    return [];
  }

  /**
   * allow to pass single condition without embedding and array
   * e.g. [{ field: 'name', op: '=', value: 'test'}] become
   * [ [ { field: 'name', op: '=', value: 'test'} ] ] to maintain a ubiquitous interface
   * but be more friendly for client usage
   * */
  const whereConditions = (
    whereConditionsParsed.length === 1 &&
    !Array.isArray(whereConditionsParsed[0])
      ? [whereConditionsParsed]
      : whereConditionsParsed
  ) as ConditionsArray<OBJECT_TYPE>;

  const allValidations = whereConditions.map((conditionsGroup) => {
    return conditionsGroup.map((cnd) => {
      if (typeof cnd !== 'object') {
        // todo replace with custom exception
        throw new BadRequestException(
          'common.validation.INTERNAL_SHOULD_BE_OBJECT',
        );
      }

      const fieldName = cnd.field as string;

      const validators =
        fieldsValidatorsDefinitions[
          fieldName as Extract<keyof OBJECT_TYPE, string>
        ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isWhereOperation = {
        valid: isEnum(cnd.op, WhereOperation),
        validatorName: IS_ENUM,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isFieldNameAvailable = {
        valid: isEnum(fieldName, Object.keys(fieldsValidatorsDefinitions)),
        validatorName: IS_ENUM,
      };

      const valuesParsed = retrieveValuesForValidationAndInstance(cnd);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const conditionMatchOperation = doesConditionMatchOperation(
        cnd.op,
        valuesParsed.instance.constructor.name,
      );

      const allErrors = validateValues(valuesParsed, validators, fieldName);

      return {
        errors: allErrors,
        instance: valuesParsed.instance,
      };
    });
  });

  const allErrors = allValidations.flatMap((validation) =>
    validation.flatMap((v) => v.errors),
  );

  if (allErrors.length > 0) {
    throw new I18nValidationException(allErrors);
  }

  return allValidations.map((validation) =>
    validation.map((v) => v.instance),
  ) as ConditionsArray<OBJECT_TYPE>;
};

export function transformConditionsToDbQuery<T>(
  conditions: ConditionsArray<T>,
  transformer: WhereOperationTransformer,
): { [key: string]: unknown }[] {
  return conditions.map((cnds) => {
    // eslint-disable-next-line unicorn/no-array-reduce
    return cnds.reduce(
      (acc, cnd) => {
        const { toDbCondition } = transformer[cnd.op];
        const classes = WHERE_OPERATIONS_UTILS[cnd.op].conditionClasses;

        const condition = cnd as Condition<T, Extract<keyof T, string>>;

        if ((classes as string[]).includes(condition.constructor.name)) {
          acc[condition.field] = toDbCondition(condition);
          return acc;
        } else {
          throw new BadRequestException(
            'common.validation.OPERATION_CONDITION_DOESNT_MATCH',
          );
        }
      },
      {} as { [key: string]: unknown },
    );
  });
}
