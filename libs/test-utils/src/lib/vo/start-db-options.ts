import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type StartDbOptions = {
  runMigrations: boolean;
  dbName: string;
  password: string;
  username: string;
  setupTransactionsManagement: boolean;
  additionalTypeOrmModuleOptions: Partial<TypeOrmModuleOptions>;
};
