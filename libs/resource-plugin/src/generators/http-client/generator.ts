import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import * as path from 'node:path';
import { HttpClientGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { constantCase, paramCase, pascalCase, camelCase } from 'change-case';

export async function httpClientGenerator(
  tree: Tree,
  options: HttpClientGeneratorSchema,
) {
  options.name = paramCase(options.name);

  const projectRoot = joinPathFragments(
    'libs',
    options.directory,
    options.name,
  );

  await libraryGenerator(tree, {
    ...options,
    buildable: true,
    publishable: true,
    unitTestRunner: 'none',
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    camelCase,
    pascalCase,
    constantCase,
  });
}

export default httpClientGenerator;
