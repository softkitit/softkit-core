import { ClassConstructor } from 'class-transformer';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import * as path from 'node:path';

export function setupYamlBaseConfigModule(
  absolutePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootSchemaClass: ClassConstructor<any>,
  fileName = '.env.yaml',
) {
  console.log('setupYamlBaseConfigModule', path.join(absolutePath, fileName));
  return TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: fileLoader({
      absolutePath: path.join(absolutePath, fileName),
      ignoreEnvironmentVariableSubstitution: false,
    }),
  });
}
