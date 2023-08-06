import type {
  WhereOperationTransformer,
  Condition,
} from '@saas-buildkit/common-types';
import {
  WhereOperation,
  OneValueCondition,
  ManyValuesCondition,
  TwoValueCondition,
} from '@saas-buildkit/common-types';
import {
  Between,
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
  [WhereOperation.BETWEEN]: {
    class: ['TwoValueCondition'],
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Between<T[V]>(
          (condition as TwoValueCondition<T, V>).value,
          (condition as TwoValueCondition<T, V>).secondValue,
        ),
      };
    },
  },
  [WhereOperation.GREATER_THAN]: {
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['ManyValuesCondition'],
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
    class: ['NoValueCondition'],
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: [Not(''), IsNull()],
      };
    },
  },
  [WhereOperation.IS_NOT_EMPTY]: {
    class: ['NoValueCondition'],
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: [Not(''), Not(IsNull())],
      };
    },
  },
  [WhereOperation.IS_NOT_NULL]: {
    class: ['NoValueCondition'],
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: Not(IsNull()),
      };
    },
  },
  [WhereOperation.IS_NULL]: {
    class: ['NoValueCondition'],
    toDbCondition: <T, V extends Extract<keyof T, string>>(
      condition: Condition<T, V>,
    ) => {
      return {
        [condition.field as string]: IsNull(),
      };
    },
  },
  [WhereOperation.LESS_THAN]: {
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['OneValueCondition'],
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
    class: ['ManyValuesCondition'],
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
    class: ['OneValueCondition'],
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
