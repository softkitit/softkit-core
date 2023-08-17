import { plainToClass, TransformFnParams } from 'class-transformer';

import { ValidationError } from 'class-validator';
import {
  Condition,
  ConditionsArray,
  getAvailableConditionsByOperations,
  ManyValuesCondition,
  NoValueCondition,
  OneValueCondition,
  WhereOperation,
  WhereOperationTransformer,
} from '../types/query.type';
import {
  NotEmptyArrayValidatorDefinition,
  IsEnumValidatorDefinition,
  IsJSONValidatorDefinition,
  IsObjectValidatorDefinition,
  IValidatorDefinition,
  validateAndThrow,
  validateAndReturnError,
} from '@saas-buildkit/validation';
import { GeneralBadRequestException } from '@saas-buildkit/exceptions';

export type ConditionWithValues<OBJECT_TYPE> = {
  values: unknown[];
  instance?: Condition<
    OBJECT_TYPE,
    keyof OBJECT_TYPE extends string
      ? Extract<keyof OBJECT_TYPE, string>
      : never
  >;
};

function retrieveValuesForValidationAndInstance<OBJECT_TYPE>(
  cnd: Condition<
    OBJECT_TYPE,
    keyof OBJECT_TYPE extends string
      ? Extract<keyof OBJECT_TYPE, string>
      : never
  >,
): ConditionWithValues<OBJECT_TYPE> {
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
    /** that's not possible to come here, because code before is checking if all conditions are valid
     * if field is present
     * if operation is valid and exists, etc... so some of these must exists and will be mapped anyway
     */
    /* istanbul ignore next */
    return {
      values: [],
      instance: undefined,
    };
  }
}

function validateValues<OBJECT_TYPE>(
  fieldName: string,
  valuesParsed: ConditionWithValues<OBJECT_TYPE>,
  validators: {
    definition: IValidatorDefinition<unknown, unknown>;
    constraint?: unknown;
  }[],
) {
  return valuesParsed.values.flatMap((value) => {
    //   validate each value using validators
    //   if any of them is invalid throw exception
    return validators
      .map((validator) => {
        return validateAndReturnError(
          validator.definition,
          fieldName,
          value,
          validator.constraint,
        );
      })
      .filter((error): error is ValidationError => error !== undefined);
  });
}

export const buildWhereConditionFromQueryParams = <OBJECT_TYPE extends object>(
  params: TransformFnParams,
  fieldsValidatorsDefinitions: {
    [key in Extract<keyof OBJECT_TYPE, string>]: {
      definition: IValidatorDefinition<unknown, unknown>;
      constraint?: unknown;
    }[];
  },
): ConditionsArray<OBJECT_TYPE> => {
  const value = params.value;

  if (value === undefined || value === '') {
    return [];
  }

  const rootFieldName = params.key;

  validateAndThrow(IsJSONValidatorDefinition, rootFieldName, value);

  /**
   * above check do use JSON.parse internally so it safe to use it here
   * */
  const whereConditionsParsed = JSON.parse(value);

  validateAndThrow(
    NotEmptyArrayValidatorDefinition,
    rootFieldName,
    whereConditionsParsed,
  );

  /**
   * allow to pass single condition without embedding and array
   * e.g. [{ field: 'name', op: '=', value: 'test'}] become
   * [ [ { field: 'name', op: '=', value: 'test'} ] ] to maintain a ubiquitous interface
   * but be more friendly for client usage
   * */
  const whereConditions = (
    whereConditionsParsed.length > 0 && !Array.isArray(whereConditionsParsed[0])
      ? [whereConditionsParsed]
      : whereConditionsParsed
  ) as ConditionsArray<OBJECT_TYPE>;

  const allValidations = whereConditions.map((conditionsGroup) => {
    return conditionsGroup.map((cnd) => {
      validateAndThrow(IsObjectValidatorDefinition, rootFieldName, cnd);

      const fieldName = cnd.field as string;

      validateAndThrow(IsEnumValidatorDefinition, 'op', cnd.op, WhereOperation);

      validateAndThrow(
        IsEnumValidatorDefinition,
        'field',
        fieldName,
        Object.keys(fieldsValidatorsDefinitions),
      );

      const validators =
        fieldsValidatorsDefinitions[
          fieldName as Extract<keyof OBJECT_TYPE, string>
        ];

      const valuesParsed = retrieveValuesForValidationAndInstance(cnd);

      const conditionMatchOperation = getAvailableConditionsByOperations(
        cnd.op,
      );

      // todo this can be improved by using a custom validator
      validateAndThrow(
        IsEnumValidatorDefinition,
        'operation',
        valuesParsed?.instance?.constructor?.name,
        conditionMatchOperation,
      );

      const allErrors = validateValues(fieldName, valuesParsed, validators);

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
    throw new GeneralBadRequestException(allErrors);
  }

  return allValidations
    .map((validation) => validation.map((v) => v.instance))
    .filter((v) => v.length > 0) as ConditionsArray<OBJECT_TYPE>;
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
        const condition = cnd as Condition<T, Extract<keyof T, string>>;

        acc[condition.field] = toDbCondition(condition);
        return acc;
      },
      {} as { [key: string]: unknown },
    );
  });
}
