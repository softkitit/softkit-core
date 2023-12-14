import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';

export interface AppGeneratorSchema extends ApplicationGeneratorOptions {
  name: string;
  title: string;
  description: string;
  i18n: boolean;
  configureJestConfig: boolean;
  health: boolean;
  languages: string[];
  auth: boolean;
  db: boolean;
  dbType?: string;
  dbName?: string;
  appPort: number;
  contactName: string;
  contactEmail: string;
  contactUrl: string;
  testsFolderName: string;
  lintCommandName?: string;
}
