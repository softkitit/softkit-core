import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Type } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

export type StartedDb = {
  container: AbstractStartedContainer;
  typeormOptions: TypeOrmModuleOptions;
  TypeOrmConfigService: Type;
};
