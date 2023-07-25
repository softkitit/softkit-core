import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DbConfig } from "./db";
import { SERVICE_BASE_PATH_TOKEN } from "../vo/constants";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private readonly dbConfig: DbConfig,
    @Inject(SERVICE_BASE_PATH_TOKEN) private serviceBasePath: string,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    this.dbConfig.entities = this.dbConfig.entities.map(
      (e) => `${this.serviceBasePath}/${e}`,
    );

    this.dbConfig.migrations = this.dbConfig.migrations.map(
      (e) => `${this.serviceBasePath}/${e}`,
    );

    return {
      ...this.dbConfig,
    } as TypeOrmModuleOptions;
  }
}
