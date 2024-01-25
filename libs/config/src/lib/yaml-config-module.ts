import { TypedConfigModule, fileLoader } from 'nest-typed-config';
import { getProfiles } from './utils/get-profiles';
import { ROOT_CONFIG_ALIAS_TOKEN } from './constants';
import { SetupConfigOptions } from './vo/setup-config-options';
import { getExistingFilePaths } from './utils/get-existing-file-paths';

export function setupYamlBaseConfigModule(options: SetupConfigOptions) {
  const {
    baseDir,
    rootSchemaClass,
    folderName = 'assets',
    baseFileName = '.env.yaml',
    profiles = getProfiles(),
  } = options;

  const existingFilePaths = getExistingFilePaths(
    baseDir,
    folderName,
    baseFileName,
    profiles,
  );

  const dynamicModule = TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: existingFilePaths.map((filePath) => {
      return fileLoader({
        absolutePath: filePath,
        ignoreEnvironmentVariableSubstitution: false,
      });
    }),
  });

  return {
    ...dynamicModule,
    providers: [
      ...(dynamicModule.providers || []),
      {
        provide: ROOT_CONFIG_ALIAS_TOKEN,
        useExisting: rootSchemaClass,
      },
    ],
    exports: [...(dynamicModule.exports || []), ROOT_CONFIG_ALIAS_TOKEN],
  };
}
