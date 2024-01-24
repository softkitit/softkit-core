import { LibraryGeneratorSchema } from '@nx/js/src/utils/schema';
import { UnitTestRunner } from '@nx/nest/src/generators/utils';

export interface LibGeneratorSchema extends LibraryGeneratorSchema {
  name: string;
  config: boolean;
  languages: string[];
  i18n: boolean;
  configureJestConfig: boolean;
  lintCommandName?: string;
  unitTestRunner: UnitTestRunner;
}
