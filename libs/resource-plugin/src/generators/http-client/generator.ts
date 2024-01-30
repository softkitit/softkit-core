import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import * as path from 'node:path';
import { HttpClientGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { constantCase, paramCase, pascalCase, camelCase } from 'change-case';
import { runLint } from '../common/run-lint';

async function extractScope(importPath: string) {
  const scope = importPath.split('/').shift();
  return scope.startsWith('@') ? `${scope}/` : '';
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
    scope,
    camelCase,
    pascalCase,
    constantCase,
  });

  tree.delete(
    path.join(
      projectRoot,
      `src/lib/${options.directory}-${options.name}.module.ts`,
    ),
  );

  if (options.lintCommandName) {
    return /* istanbul ignore next */ () =>
      runLint(options.name, options.lintCommandName);
  }
}

export default httpClientGenerator;
