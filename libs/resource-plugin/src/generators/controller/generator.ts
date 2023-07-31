import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { ControllerGeneratorSchema } from './schema';
import { capitalCase, paramCase, pascalCase, snakeCase } from 'change-case';
import { EOL } from 'node:os';

export async function controllerGenerator(
  tree: Tree,
  options: ControllerGeneratorSchema,
) {
  const appRoot = readProjectConfiguration(tree, options.projectName).root;

  const srcFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, srcFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
    paramCase,
    capitalCase,
  });

  const controllersFolder = joinPathFragments(appRoot, 'src/app/controllers');
  const groupName = options.groupName || '';

  const exportPathForIndex = joinPathFragments(
    groupName,
    `${options.controllerName}.controller`,
  );

  const indexFilePath = joinPathFragments(controllersFolder, `index.ts`);

  const contents = tree.exists(indexFilePath)
    ? tree.read(indexFilePath).toString()
    : '';
  const newContents = `${contents}${EOL}export * from './${exportPathForIndex}';`;
  tree.write(indexFilePath, newContents);
  //   todo run eslint --fix
}

export default controllerGenerator;
