import { ClassConstructor } from 'class-transformer';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import * as path from 'node:path';
import { getProfiles } from './utils/get-profiles';
import { ROOT_CONFIG_ALIAS_TOKEN } from './constants';

export function setupYamlBaseConfigModule(
  absolutePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootSchemaClass: ClassConstructor<unknown>,
  fileName = '.env.yaml',
  profiles = getProfiles(),
) {
  const fileNameSplit = fileName.split('.');
  const extension = fileNameSplit.at(-1);
  const justName = fileNameSplit.slice(0, -1).join('.');
  const profilesPaths = profiles.map((p) => `${justName}-${p}.${extension}`);

  const dynamicModule = TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: [fileName, ...profilesPaths].map((name) => {
      return fileLoader({
        absolutePath: path.join(absolutePath, name),
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
