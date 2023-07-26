import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DbConfig } from './db';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  /* istanbul ignore next */
  constructor(private readonly dbConfig: DbConfig) {}

  /* istanbul ignore next */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.dbConfig,
    } as TypeOrmModuleOptions;
  }
}
