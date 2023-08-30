import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  Tree,
  updateJson,
} from '@nx/devkit';
import { LibGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { paramCase, pascalCase } from 'change-case';

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
    const configFolder = joinPathFragments(__dirname, './files/i18n');

    generateFiles(tree, configFolder, libRoot, {
      ...options,
      pascalCase,
    });

    if (options.buildable) {
      updateJson(
        tree,
        joinPathFragments(options.name, 'project.json'),
        (prjJson) => {
          // if scripts is undefined, set it to an empty object
          prjJson.targets.build.options.assets = [
            ...prjJson.targets.build.options.assets,
            {
              glob: '**/*',
              input: `libs/${options.name}/src/lib/i18n/`,
              output: 'i18n',
            },
          ];
          return prjJson;
        },
      );
    }
  }

  await formatFiles(tree);
}

export default libGenerator;
