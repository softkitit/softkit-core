import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type StartDbOptions = {
  runMigrations: boolean;
  dbName: string;
  password: string;
  imageTag: string;
  username: string;
  setupTransactionsManagement: boolean;
  additionalTypeOrmModuleOptions: Partial<TypeOrmModuleOptions>;
};
