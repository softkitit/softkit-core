import { ClassConstructor } from 'class-transformer';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import * as path from 'node:path';

/**
 * @link https://nestjs-i18n.com/guides/
 * */
export function setupYamlModule(
  absolutePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootSchemaClass: ClassConstructor<any>,
  fileName = '.env.yaml',
) {
  TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: fileLoader({
      absolutePath: path.join(absolutePath, fileName),
      basename: fileName,
      ignoreEnvironmentVariableSubstitution: false,
    }),
  });
}
