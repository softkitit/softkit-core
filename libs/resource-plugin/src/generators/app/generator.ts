import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';

import { AppGeneratorSchema } from './schema';
import { paramCase, pascalCase, snakeCase } from 'change-case';
import i18nGenerator from '../i18n/generator';

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  options.name = paramCase(options.name);
  const appRoot = `apps/${options.name}`;
  const srcFolder = joinPathFragments(options.name, 'src');

  await applicationGenerator(tree, options);

  const allFilesInSrc = tree
    .listChanges()
    .filter((c) => c.path.includes(srcFolder));

  for (const f of allFilesInSrc) {
    tree.delete(f.path);
  }

  const generatorFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, generatorFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
  });

  if (!options.db) {
    const dbFiles = tree
      .listChanges()
      .filter(
        (c) => c.path.includes('/db/') || c.path.includes('/repositories/'),
      );

    for (const c of dbFiles) tree.delete(c.path);
  }

  if (options.i18n) {
    await i18nGenerator(tree, {
      ...options,
      buildable: true,
      baseFolder: 'apps',
    });
  }
}

export default appGenerator;
