import { BadRequestException } from '@nestjs/common';

export enum WhereOperation {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'IN',
  NOT_IN = '!IN',
  LIKE = 'LIKE',
  LIKE_START_WITH = '%LIKE',
  LIKE_END_WITH = 'LIKE%',
  ILIKE = 'ILIKE',
  ILIKE_START_WITH = '%ILIKE',
  ILIKE_END_WITH = 'ILIKE%',
  BETWEEN = 'BETWEEN',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
}

export type WhereOperationTransformer = {
  [key in WhereOperation]: {
    class: Array<
      | 'NoValueCondition'
      | 'OneValueCondition'
      | 'TwoValueCondition'
      | 'ManyValuesCondition'
    >;
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      [key: string]: unknown;
    };
  };
};

export type Condition<T, V extends Extract<keyof T, string>> =
  | NoValueCondition<V>
  | OneValueCondition<T, V>
  | TwoValueCondition<T, V>
  | ManyValuesCondition<T, V>;

export type ConditionsArray<T> = Condition<T, Extract<keyof T, string>>[][];

export class NoValueCondition<T extends string> {
  field!: T;
  op!: WhereOperation;
}

export class OneValueCondition<
  OBJECT,
  K extends Extract<keyof OBJECT, string>,
> extends NoValueCondition<K> {
  value!: OBJECT[K];
}

export class TwoValueCondition<
  OBJECT,
  K extends Extract<keyof OBJECT, string>,
> extends OneValueCondition<OBJECT, K> {
  secondValue!: OBJECT[K];
}

export class ManyValuesCondition<
  OBJECT,
  K extends Extract<keyof OBJECT, string>,
> extends NoValueCondition<K> {
  values!: OBJECT[K][];
}

type OperationToConditionMappingType = {
  [key in WhereOperation]: string;
};

const conditionToOperationMappingType: OperationToConditionMappingType = {
  [WhereOperation.EQUALS]: OneValueCondition.constructor.name,
  [WhereOperation.NOT_EQUALS]: OneValueCondition.constructor.name,
  [WhereOperation.GREATER_THAN]: OneValueCondition.constructor.name,
  [WhereOperation.GREATER_THAN_OR_EQUAL]: OneValueCondition.constructor.name,
  [WhereOperation.LESS_THAN]: OneValueCondition.constructor.name,
  [WhereOperation.LESS_THAN_OR_EQUAL]: OneValueCondition.constructor.name,
  [WhereOperation.IN]: ManyValuesCondition.constructor.name,
  [WhereOperation.NOT_IN]: ManyValuesCondition.constructor.name,
  [WhereOperation.LIKE]: OneValueCondition.constructor.name,
  [WhereOperation.LIKE_START_WITH]: OneValueCondition.constructor.name,
  [WhereOperation.LIKE_END_WITH]: OneValueCondition.constructor.name,
  [WhereOperation.ILIKE]: OneValueCondition.constructor.name,
  [WhereOperation.ILIKE_START_WITH]: OneValueCondition.constructor.name,
  [WhereOperation.ILIKE_END_WITH]: OneValueCondition.constructor.name,
  [WhereOperation.BETWEEN]: TwoValueCondition.constructor.name,
  [WhereOperation.IS_NULL]: NoValueCondition.constructor.name,
  [WhereOperation.IS_NOT_NULL]: NoValueCondition.constructor.name,
  [WhereOperation.IS_EMPTY]: NoValueCondition.constructor.name,
  [WhereOperation.IS_NOT_EMPTY]: NoValueCondition.constructor.name,
};

export function doesConditionMatchOperation(
  operation: WhereOperation,
  constructorName: string,
) {
  // eslint-disable-next-line security/detect-object-injection
  return conditionToOperationMappingType[operation] === constructorName;
}

export function transformConditionsToDbQuery<T>(
  conditions: ConditionsArray<T>,
  transformer: WhereOperationTransformer,
): { [key: string]: unknown }[] {
  return conditions.map((cnds) => {
    // eslint-disable-next-line unicorn/no-array-reduce
    return cnds.reduce(
      (acc, cnd) => {
        const { class: classes, toDbCondition } = transformer[cnd.op];

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
