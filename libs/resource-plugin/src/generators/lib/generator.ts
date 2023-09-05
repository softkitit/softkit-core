import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { LibGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { paramCase, pascalCase } from 'change-case';
import i18nGenerator from '../i18n/generator';

export async function libGenerator(tree: Tree, options: LibGeneratorSchema) {
  options.name = paramCase(options.name);
  const libRoot = `libs/${options.name}`;

  await libraryGenerator(tree, options);

  if (options.config) {
    const configFolder = joinPathFragments(__dirname, './files/config');

    generateFiles(tree, configFolder, libRoot, {
      ...options,
      pascalCase,
    });
  }

  if (options.i18n) {
    await i18nGenerator(tree, {
      name: options.name,
      languages: options.languages,
      baseFolder: 'libs',
      buildable: options.buildable,
    });
  }
}

export default libGenerator;