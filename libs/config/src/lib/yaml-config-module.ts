import { ClassConstructor } from 'class-transformer';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import * as path from 'node:path';
import { getProfiles } from './utils/get-profiles';
import { ROOT_CONFIG_ALIAS_TOKEN } from './constants';

export function setupYamlBaseConfigModule(
  baseDir: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootSchemaClass: ClassConstructor<unknown>,
  folderName = 'assets',
  baseFileName = '.env.yaml',
  profiles = getProfiles(),
) {
  const fileNameSplit = baseFileName.split('.');
  const extension = fileNameSplit.at(-1);
  const justName = fileNameSplit.slice(0, -1).join('.');
  const profilesPaths = profiles.map((p) => `${justName}-${p}.${extension}`);

  const dynamicModule = TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: [baseFileName, ...profilesPaths].map((name) => {
      return fileLoader({
        absolutePath: path.join(baseDir, folderName, name),
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
