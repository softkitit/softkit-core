import { generateFiles, joinPathFragments, Tree, updateJson } from '@nx/devkit';
import { I18nGeneratorSchema } from './schema';
import { paramCase, pascalCase } from 'change-case';

export async function i18nGenerator(tree: Tree, options: I18nGeneratorSchema) {
  options.name = paramCase(options.name);

  const root = joinPathFragments(options.baseFolder, options.name);

  const baseSubfolder = options.baseFolder.slice(0, -1);

  const i18nFolder = joinPathFragments(__dirname, './files/i18n');

  generateFiles(tree, i18nFolder, root, {
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
            input: joinPathFragments(root, `src/${baseSubfolder}/i18n/`),
            output: 'i18n',
          },
        ];
        return prjJson;
      },
    );
  }

  for (const lang of options.languages) {
    tree.write(
      joinPathFragments(
        root,
        `src/${baseSubfolder}/i18n/${lang}/${options.name}.json`,
      ),
      `{}`,
    );
  }
}

export default i18nGenerator;
