import type {
  WhereOperationTransformer,
  Condition,
} from '@saas-buildkit/common-types';
import {
  WhereOperation,
  OneValueCondition,
  ManyValuesCondition,
} from '@saas-buildkit/common-types';
import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

const TYPE_ORM_TRANSFORMERS: WhereOperationTransformer = {
  [WhereOperation.GREATER_THAN]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: MoreThan<T[V]>(
          (condition as OneValueCondition<T, V>).value,
        ),
      };
    },
  },
  [WhereOperation.GREATER_THAN_OR_EQUAL]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: MoreThanOrEqual<T[V]>(
          (condition as OneValueCondition<T, V>).value,
        ),
      };
    },
  },
  [WhereOperation.ILIKE]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: ILike<string>(
          `%${(condition as OneValueCondition<T, V>).value}%`,
        ),
      };
    },
  },
  [WhereOperation.ILIKE_END_WITH]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: ILike<string>(
          `%${(condition as OneValueCondition<T, V>).value}`,
        ),
      };
    },
  },
  [WhereOperation.ILIKE_START_WITH]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: ILike<string>(
          `${(condition as OneValueCondition<T, V>).value}%`,
        ),
      };
    },
  },
  [WhereOperation.IN]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: In<T[V]>(
          (condition as ManyValuesCondition<T, V>).values,
        ),
      };
    },
  },
  [WhereOperation.IS_EMPTY]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: [Not(''), IsNull()],
      };
    },
  },
  [WhereOperation.IS_NOT_EMPTY]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: [Not(''), Not(IsNull())],
      };
    },
  },
  [WhereOperation.IS_NOT_NULL]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Not(IsNull()),
      };
    },
  },
  [WhereOperation.IS_NULL]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: IsNull(),
      };
    },
  },
  [WhereOperation.LESS_THAN]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: LessThan<T[V]>(
          (condition as OneValueCondition<T, V>).value,
        ),
      };
    },
  },
  [WhereOperation.LESS_THAN_OR_EQUAL]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: LessThanOrEqual<T[V]>(
          (condition as OneValueCondition<T, V>).value,
        ),
      };
    },
  },
  [WhereOperation.LIKE]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Like<string>(
          `%${(condition as OneValueCondition<T, V>).value}%`,
        ),
      };
    },
  },
  [WhereOperation.LIKE_END_WITH]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Like<string>(
          `%${(condition as OneValueCondition<T, V>).value}`,
        ),
      };
    },
  },
  [WhereOperation.LIKE_START_WITH]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Like<string>(
          `${(condition as OneValueCondition<T, V>).value}%`,
        ),
      };
    },
  },
  [WhereOperation.NOT_EQUALS]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Not<T[V]>(
          (condition as OneValueCondition<T, V>).value,
        ),
      };
    },
  },
  [WhereOperation.NOT_IN]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Not<T[V]>(
          In<T[V]>((condition as ManyValuesCondition<T, V>).values),
        ),
      };
    },
  },
  [WhereOperation.EQUALS]: {
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: (condition as OneValueCondition<T, V>)
          .value,
      };
    },
  },
};

export { TYPE_ORM_TRANSFORMERS };
