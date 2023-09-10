import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

export function buildTypeormConfigService(
  typeormOptions: TypeOrmModuleOptions,
) {
  @Injectable()
  class TypeOrmConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
      return {
        ...typeormOptions,
      } as TypeOrmModuleOptions;
    }
  }

  return TypeOrmConfigService;
}
