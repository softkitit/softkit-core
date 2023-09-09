import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import * as path from 'node:path';
import { HttpClientGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { constantCase, paramCase, pascalCase, camelCase } from 'change-case';

async function extractScope(importPath: string) {
  const scope = importPath.split('/').pop();
  return scope.startsWith('@') ? { scope: `${scope}/` } : { scope: '' };
}

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

  const scope = await extractScope(options.importPath);

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...scope,
    camelCase,
    pascalCase,
    constantCase,
  });
}

export default httpClientGenerator;
