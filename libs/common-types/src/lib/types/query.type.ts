export enum WhereOperation {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  LIKE = '%%',
  LIKE_START_WITH = '%_',
  LIKE_END_WITH = '_%',
  ILIKE = '*%%',
  ILIKE_START_WITH = '*%_',
  ILIKE_END_WITH = '*_%',
  IS_NULL = 'N',
  IS_NOT_NULL = '!N',
  IS_EMPTY = 'E',
  IS_NOT_EMPTY = '!E',
  IN = 'IN',
  NOT_IN = '!IN',
}

type ConditionClassName =
  | 'NoValueCondition'
  | 'OneValueCondition'
  | 'ManyValuesCondition';

export const WHERE_OPERATIONS_UTILS: {
  [key in WhereOperation]: {
    conditionClasses: Array<ConditionClassName>;
  };
} = {
  [WhereOperation.EQUALS]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.NOT_EQUALS]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.GREATER_THAN]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.GREATER_THAN_OR_EQUAL]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.LESS_THAN]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.LESS_THAN_OR_EQUAL]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.IN]: {
    conditionClasses: ['ManyValuesCondition'],
  },
  [WhereOperation.NOT_IN]: {
    conditionClasses: ['ManyValuesCondition'],
  },
  [WhereOperation.LIKE]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.LIKE_START_WITH]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.LIKE_END_WITH]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.ILIKE]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.ILIKE_START_WITH]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.ILIKE_END_WITH]: {
    conditionClasses: ['OneValueCondition'],
  },
  [WhereOperation.IS_NULL]: {
    conditionClasses: ['NoValueCondition'],
  },
  [WhereOperation.IS_NOT_NULL]: {
    conditionClasses: ['NoValueCondition'],
  },
  [WhereOperation.IS_EMPTY]: {
    conditionClasses: ['NoValueCondition'],
  },
  [WhereOperation.IS_NOT_EMPTY]: {
    conditionClasses: ['NoValueCondition'],
  },
};

export type WhereOperationTransformer = {
  [key in WhereOperation]: {
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

export class ManyValuesCondition<
  OBJECT,
  K extends Extract<keyof OBJECT, string>,
> extends NoValueCondition<K> {
  values!: OBJECT[K][];
}

export function doesConditionMatchOperation(
  operation: WhereOperation,
  constructorName: string,
) {
  // eslint-disable-next-line security/detect-object-injection
  return WHERE_OPERATIONS_UTILS[operation].conditionClasses.includes(
    constructorName as ConditionClassName,
  );
}
