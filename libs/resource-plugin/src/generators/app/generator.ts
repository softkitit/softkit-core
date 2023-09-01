import { generateFiles, joinPathFragments, Tree, updateJson } from '@nx/devkit';
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

  updateJson(
    tree,
    joinPathFragments(options.name, 'project.json'),
    (prjJson) => {
      // if scripts is undefined, set it to an empty object
      prjJson.targets.build.options.assets = [
        ...prjJson.targets.build.options.assets,
        {
          glob: '**/*',
          input: `apps/${options.name}/src/app/assets`,
          output: 'assets',
        },
      ];
      prjJson.targets.build.options.tsPlugins = [
        ...(prjJson.targets.build.options.tsPlugins || []),
        {
          name: '@nestjs/swagger/plugin',
          options: {
            dtoFileNameSuffix: [
              options.db ? '.entity.ts' : '',
              '.dto.ts',
            ].filter((value) => value !== ''),
            controllerFileNameSuffix: ['.controller.ts'],
            classValidatorShim: true,
            dtoKeyOfComment: 'description',
            controllerKeyOfComment: 'description',
            introspectComments: true,
          },
        },
      ];

      return prjJson;
    },
  );
}

export default appGenerator;
