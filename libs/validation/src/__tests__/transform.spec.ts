import { BaseTransformEntity } from './app/vo/transform/base-transform.entity';
import { plainToInstance } from 'class-transformer';
import { TransformSimpleEntity } from './app/vo/transform/transform-simple.entity';
import { WithPasswordFieldEntity } from './app/vo/transform/with-password-field.entity';
import { TransformWithChildEntity } from './app/vo/transform/transform-with-child.entity';
import { TransformWithChildArrayEntity } from './app/vo/transform/transform-with-child-array.entity';

const baseEntity: BaseTransformEntity = {
  id: 'id',
  name: 'name',
  description: 'description',
  tenantId: 'tenantId',
  number: 1,
  bool: true,
  child: {
    id: 'id',
    name: 'name',
  },
  childArr: [
    {
      id: 'id',
      name: 'name',
    },
  ],
  password: 'password',
};

describe('transform unit tests', () => {
  it('should transform base entity to simple with 2 fields', () => {
    const transformSimpleEntity = plainToInstance(
      TransformSimpleEntity,
      baseEntity,
      {
        excludeExtraneousValues: true,
        ignoreDecorators: true,
      },
    );
    expect(Object.keys(transformSimpleEntity).length).toBe(2);

    expect(transformSimpleEntity.id).toBe(baseEntity.id);
    expect(transformSimpleEntity.name).toBe(baseEntity.name);
  });

  it('should transform base entity to one with a password', () => {
    const entityWithPassword = plainToInstance(
      WithPasswordFieldEntity,
      baseEntity,
      {
        excludeExtraneousValues: true,
        ignoreDecorators: true,
      },
    );
    expect(Object.keys(entityWithPassword).length).toBe(1);

    expect(entityWithPassword.password).toBe(baseEntity.password);
  });

  it('should transform base entity to one with a password with exclusions', () => {
    const entityWithPassword = plainToInstance(
      WithPasswordFieldEntity,
      baseEntity,
      {
        excludeExtraneousValues: true,
        ignoreDecorators: false,
      },
    );
    expect(Object.keys(entityWithPassword).length).toBe(0);
  });

  it('should transform base entity to one custom child', () => {
    const transformed = plainToInstance(TransformWithChildEntity, baseEntity, {
      excludeExtraneousValues: true,
      ignoreDecorators: false,
    });
    expect(Object.keys(transformed).length).toBe(3);

    expect(transformed.id).toBe(baseEntity.id);
    expect(transformed.name).toBe(baseEntity.name);
    expect(transformed.child).toBeDefined();

    expect(Object.keys(transformed.child).length).toBe(1);

    expect(transformed.child.id).toBe(baseEntity?.child?.id);
  });

  it('should transform base entity to custom children array', () => {
    const transformed = plainToInstance(
      TransformWithChildArrayEntity,
      baseEntity,
      {
        excludeExtraneousValues: true,
      },
    );
    expect(Object.keys(transformed).length).toBe(3);

    expect(transformed.id).toBe(baseEntity.id);
    expect(transformed.name).toBe(baseEntity.name);
    expect(transformed.childArr).toBeDefined();
    expect(transformed.childArr.length).toBe(1);

    expect(Object.keys(transformed.childArr[0]).length).toBe(1);

    const childArrElement = (baseEntity.childArr || [])[0];
    expect(transformed.childArr[0].id).toBe(childArrElement?.id);
  });
});
