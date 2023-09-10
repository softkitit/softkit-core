import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { MixedList } from 'typeorm/common/MixedList';
import { EntitySchema } from 'typeorm/entity-schema/EntitySchema';

export function buildTypeormConfigService(
  typeormOptions: TypeOrmModuleOptions,
) {
  @Injectable()
  class TypeOrmConfigService implements TypeOrmOptionsFactory {
    // eslint-disable-next-line @typescript-eslint/ban-types
    public static entities: MixedList<Function | string | EntitySchema> = [];

    createTypeOrmOptions(): TypeOrmModuleOptions {
      return {
        entities: TypeOrmConfigService.entities,
        ...typeormOptions,
      } as TypeOrmModuleOptions;
    }
  }

  return TypeOrmConfigService;
}
