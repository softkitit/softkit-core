import {
  ManyValuesCondition,
  NoValueCondition,
  OneValueCondition,
  WhereOperation,
  WhereOperationTransformer,
} from '../types/query.type';
import {
  buildWhereConditionFromQueryParams,
  transformConditionsToDbQuery,
} from '../transformers/where-condition.transformer';
import { TransformationType } from 'class-transformer';
import { faker } from '@faker-js/faker';
import {
  IsBooleanValidatorDefinition,
  IsDateValidatorDefinition,
  IsEnumValidatorDefinition,
  IsNumberValidatorDefinition,
  IsStringValidatorDefinition,
  IValidatorDefinition,
} from '@saas-buildkit/validation';
import { GeneralBadRequestException } from '@saas-buildkit/exceptions';

enum SampleEnum {
  VALUE = 'VALUE',
  NEXT_VALUE = 'NEXT_VALUE',
}

class TestEntity {
  id!: string;
  age!: number;
  isCool!: boolean;
  sampleEnum!: SampleEnum;
  createdAt!: Date;
}

const validators: {
  [key in Extract<keyof TestEntity, string>]: {
    definition: IValidatorDefinition<unknown, object>;
    constraint?: unknown;
  }[];
} = {
  id: [
    {
      definition: IsStringValidatorDefinition,
    },
  ],
  age: [
    {
      definition: IsNumberValidatorDefinition,
    },
  ],
  isCool: [
    {
      definition: IsBooleanValidatorDefinition,
    },
  ],
  sampleEnum: [
    {
      definition: IsEnumValidatorDefinition,
      constraint: SampleEnum,
    },
  ],
  createdAt: [
    {
      definition: IsDateValidatorDefinition,
    },
  ],
};

describe('transform json data success cases', () => {
  it.each([
    {
      field: 'id',
      op: WhereOperation.IS_NULL,
    },
    {
      field: 'age',
      op: WhereOperation.IS_NOT_NULL,
    },
    {
      field: 'isCool',
      op: WhereOperation.IS_EMPTY,
    },
    {
      field: 'sampleEnum',
      op: WhereOperation.IS_NOT_EMPTY,
    },
  ])('no value condition tests: %s', async (operation) => {
    const operationsArrays = [operation];
    const operationString = JSON.stringify(operationsArrays);

    const transformedConditions = buildWhereConditionFromQueryParams(
      {
        value: operationString,
        key: 'where',
        type: TransformationType.PLAIN_TO_CLASS,
        obj: {},
        options: {},
      },
      validators,
    );

    expect(transformedConditions.length).toBe(1);
    expect(transformedConditions[0].length).toBe(1);

    const condition = transformedConditions[0][0];

    expect(condition).toBeInstanceOf(NoValueCondition);

    expect(condition.field).toBe(operation.field);
    expect(condition.op).toBe(operation.op);
  });

  it.each([
    {
      field: 'id',
      op: WhereOperation.EQUALS,
      value: faker.string.uuid(),
    },
    {
      field: 'age',
      op: WhereOperation.NOT_EQUALS,
      value: faker.number.int({
        min: 1,
        max: 100,
      }),
    },
    {
      field: 'age',
      op: WhereOperation.GREATER_THAN,
      value: 10,
    },
    {
      field: 'age',
      op: WhereOperation.GREATER_THAN_OR_EQUAL,
      value: 10,
    },
    {
      field: 'age',
      op: WhereOperation.LESS_THAN,
      value: 10,
    },
    {
      field: 'age',
      op: WhereOperation.LESS_THAN_OR_EQUAL,
      value: 10,
    },
    {
      field: 'id',
      op: WhereOperation.LIKE,
      value: 'someid',
    },
    {
      field: 'id',
      op: WhereOperation.LIKE_START_WITH,
      value: 'someid',
    },
    {
      field: 'id',
      op: WhereOperation.LIKE_END_WITH,
      value: 'someid',
    },
    {
      field: 'id',
      op: WhereOperation.ILIKE,
      value: 'someid',
    },
    {
      field: 'id',
      op: WhereOperation.ILIKE_START_WITH,
      value: 'someid',
    },
    {
      field: 'id',
      op: WhereOperation.ILIKE_END_WITH,
      value: 'someid',
    },
  ])('single value condition tests: %s', async (operation) => {
    const operationsArrays = [operation];
    const operationString = JSON.stringify(operationsArrays);

    const transformedConditions = buildWhereConditionFromQueryParams(
      {
        value: operationString,
        key: 'where',
        type: TransformationType.PLAIN_TO_CLASS,
        obj: {},
        options: {},
      },
      validators,
    );

    expect(transformedConditions.length).toBe(1);
    expect(transformedConditions[0].length).toBe(1);

    const condition = transformedConditions[0][0] as OneValueCondition<
      unknown,
      never
    >;

    expect(condition).toBeInstanceOf(OneValueCondition);

    expect(condition.field).toBe(operation.field);
    expect(condition.op).toBe(operation.op);
    expect(condition.value).toBe(operation.value);
  });

  it.each([
    {
      field: 'id',
      op: WhereOperation.IN,
      values: ['1', '2', '3'],
    },
    {
      field: 'age',
      op: WhereOperation.NOT_IN,
      values: [1, 2, 3],
    },
  ])('many values condition tests: %s', async (operation) => {
    const operationsArrays = [operation];
    const operationString = JSON.stringify(operationsArrays);

    const transformedConditions = buildWhereConditionFromQueryParams(
      {
        value: operationString,
        key: 'where',
        type: TransformationType.PLAIN_TO_CLASS,
        obj: {},
        options: {},
      },
      validators,
    );

    expect(transformedConditions.length).toBe(1);
    expect(transformedConditions[0].length).toBe(1);

    const condition = transformedConditions[0][0] as ManyValuesCondition<
      unknown,
      never
    >;

    expect(condition).toBeInstanceOf(ManyValuesCondition);

    expect(condition.field).toBe(operation.field);
    expect(condition.op).toBe(operation.op);
    expect(condition.values).toStrictEqual(operation.values);
  });

  it('various combinations of conditions: %s', async () => {
    const mixOfOperations = [
      [
        {
          field: 'id',
          op: WhereOperation.IN,
          values: ['1', '2', '3'],
        },
        {
          field: 'id',
          op: WhereOperation.ILIKE_START_WITH,
          value: 'someid',
        },
        {
          field: 'id',
          op: WhereOperation.IS_NULL,
        },
      ],
      [
        {
          field: 'id',
          op: WhereOperation.NOT_IN,
          values: ['1', '2', '3'],
        },
        {
          field: 'id',
          op: WhereOperation.LIKE,
          value: 'someid',
        },
        {
          field: 'age',
          op: WhereOperation.IS_NOT_NULL,
        },
      ],
    ];

    const operationString = JSON.stringify(mixOfOperations);

    const transformedConditions = buildWhereConditionFromQueryParams(
      {
        value: operationString,
        key: 'where',
        type: TransformationType.PLAIN_TO_CLASS,
        obj: {},
        options: {},
      },
      validators,
    );

    expect(transformedConditions.length).toBe(2);
    expect(transformedConditions[0].length).toBe(3);
    expect(transformedConditions[1].length).toBe(3);

    for (let i = 0; i < transformedConditions.length; i++) {
      for (let j = 0; j < transformedConditions.length; j++) {
        const neededClass =
          j === 0
            ? ManyValuesCondition
            : // eslint-disable-next-line unicorn/no-nested-ternary
            j === 1
            ? OneValueCondition
            : NoValueCondition;

        const condition = transformedConditions[i][j] as unknown as {
          [key: string]: unknown;
        };

        expect(condition).toBeInstanceOf(neededClass);

        expect(condition['field']).toBe(mixOfOperations[i][j].field);
        expect(condition['op']).toBe(mixOfOperations[i][j].op);
        expect(condition['values']).toStrictEqual(mixOfOperations[i][j].values);
      }
    }
  });

  describe('invalid data passed', () => {
    it('invalid json passed', async () => {
      expect(() =>
        buildWhereConditionFromQueryParams(
          {
            value: 'not a valid json',
            key: 'where',
            type: TransformationType.PLAIN_TO_CLASS,
            obj: {},
            options: {},
          },
          validators,
        ),
      ).toThrow(GeneralBadRequestException);
    });

    it.each([
      {
        field: 'id',
        op: 'invalid operation',
        values: ['1', '2', '3'],
      },
      {
        field: 'id',
        op: 'invalid operation',
        // invalid type, must be string
        values: [1, 2, 3],
      },
      {
        field: 'unkownname',
        op: WhereOperation.NOT_IN,
        values: [1, 2, 3],
      },
      {
        field: 'sampleEnum',
        op: WhereOperation.EQUALS,
        value: 'invalid value',
      },
    ])('invalid values tests: %s', async (operation) => {
      const operationsArrays = [operation];
      const operationString = JSON.stringify(operationsArrays);

      expect(() =>
        buildWhereConditionFromQueryParams(
          {
            value: operationString,
            key: 'where',
            type: TransformationType.PLAIN_TO_CLASS,
            obj: {},
            options: {},
          },
          validators,
        ),
      ).toThrow(GeneralBadRequestException);
    });

    it.each([
      '[{}, {}]',
      '[{"bla":"bla"}, {}]',
      '[[[{}]], [[{}]]]',
      '[[{}], [{}]]',
      ' ',
    ])('empty objects and array failed cases: %s', async (operation) => {
      expect(() =>
        buildWhereConditionFromQueryParams(
          {
            value: operation,
            key: 'where',
            type: TransformationType.PLAIN_TO_CLASS,
            obj: {},
            options: {},
          },
          validators,
        ),
      ).toThrow(GeneralBadRequestException);
    });

    it.each(['[[], []]', '[]', ''])(
      'empty objects and array success cases: %s',
      async (operation) => {
        const operations = buildWhereConditionFromQueryParams(
          {
            value: operation,
            key: 'where',
            type: TransformationType.PLAIN_TO_CLASS,
            obj: {},
            options: {},
          },
          validators,
        );

        expect(operations.length).toBe(0);
      },
    );
  });

  describe('transform conditions to db query', () => {
    it.each([
      {
        field: 'id',
        op: WhereOperation.IN,
        values: ['1', '2', '3'],
      },
      {
        field: 'age',
        op: WhereOperation.NOT_IN,
        values: [1, 2, 3],
      },
    ])('simple transformer: %s', async (operation) => {
      const operationsArrays = [operation];
      const operationString = JSON.stringify(operationsArrays);

      const transformedConditions = buildWhereConditionFromQueryParams(
        {
          value: operationString,
          key: 'where',
          type: TransformationType.PLAIN_TO_CLASS,
          obj: {},
          options: {},
        },
        validators,
      );

      // eslint-disable-next-line unicorn/no-array-reduce
      const transformer = Object.entries(WhereOperation).reduce(
        (acc, [key, val]) => {
          acc[val.toString()] = {
            toDbCondition: (cnd: ManyValuesCondition<any, any>) => {
              return `${val} ${cnd.values}`;
            },
          };
          return acc;
        },
        {} as { [key: string]: unknown },
      ) as WhereOperationTransformer;

      const transformedQuery = transformConditionsToDbQuery(
        transformedConditions,
        transformer,
      );

      expect(transformedQuery).toStrictEqual([
        {
          [operation.field]: `${operation.op} ${operation.values}`,
        },
      ]);
    });
  });
});
