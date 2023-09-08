import { generateFiles, joinPathFragments, Tree, updateJson } from '@nx/devkit';
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

  if (options.publishable) {
    updateProjectJson(tree, options);
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

function updateProjectJson(tree: Tree, options: LibGeneratorSchema) {
  updateJson(
    tree,
    joinPathFragments(options.name, 'project.json'),
    (prjJson) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { publish, ...other } = prjJson.targets;

      prjJson.targets = other;

      return prjJson;
    },
  );
}

export default libGenerator;
