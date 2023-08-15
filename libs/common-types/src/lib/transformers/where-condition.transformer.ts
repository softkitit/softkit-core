import { plainToClass, TransformFnParams } from 'class-transformer';

import { I18nValidationException } from '@saas-buildkit/nestjs-i18n/dist/interfaces/i18n-validation-error.interface';
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
  IsArrayValidatorDefinition,
  IsEnumValidatorDefinition,
  IsJSONValidatorDefinition,
  IsObjectValidatorDefinition,
  IValidatorDefinition,
  throwValidationException,
  validateAndReturnError,
} from '@saas-buildkit/validation';

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

// eslint-disable-next-line complexity
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

  throwValidationException(IsJSONValidatorDefinition, {
    key: params.key,
    value: value,
  });

  /**
   * above check do use JSON.parse internally so it safe to use it here
   * */
  const whereConditionsParsed = JSON.parse(value);

  throwValidationException(IsArrayValidatorDefinition, {
    key: params.key,
    value: value,
  });

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
      throwValidationException(IsObjectValidatorDefinition, {
        key: params.key,
        value: cnd,
      });

      const fieldName = cnd.field as string;

      const validators =
        fieldsValidatorsDefinitions[
          fieldName as Extract<keyof OBJECT_TYPE, string>
        ];

      throwValidationException(
        IsEnumValidatorDefinition,
        {
          key: 'op',
          value: cnd.op,
        },
        WhereOperation,
      );

      throwValidationException(
        IsEnumValidatorDefinition,
        {
          key: 'field',
          value: fieldName,
        },
        Object.keys(fieldsValidatorsDefinitions),
      );

      const valuesParsed = retrieveValuesForValidationAndInstance(cnd);

      const conditionMatchOperation = getAvailableConditionsByOperations(
        cnd.op,
      );

      throwValidationException(
        IsEnumValidatorDefinition,
        {
          key: 'operation',
          value: valuesParsed?.instance?.constructor?.name,
        },
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
        const condition = cnd as Condition<T, Extract<keyof T, string>>;

        acc[condition.field] = toDbCondition(condition);
        return acc;
      },
      {} as { [key: string]: unknown },
    );
  });
}
