import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { RepositoryGeneratorSchema } from './schema';
import { pascalCase, snakeCase } from 'change-case';
import { EOL } from 'node:os';
import { runLint } from '../common/run-lint';

export async function repositoryGenerator(
  tree: Tree,
  options: RepositoryGeneratorSchema,
) {
  const appRoot = readProjectConfiguration(tree, options.projectName).root;

  const srcFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, srcFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
  });

  const repositoriesFolder = joinPathFragments(appRoot, 'src/app/repositories');
  const repositoryFileName = `${options.repositoryName}.repository`;

  const exportPathForIndex = options.groupName
    ? joinPathFragments(options.groupName, repositoryFileName)
    : repositoryFileName;

  const indexFilePath = joinPathFragments(repositoriesFolder, `index.ts`);

  const contents = tree.exists(indexFilePath)
    ? tree.read(indexFilePath).toString()
    : '';
  const newContents = `${contents}${EOL}export * from './${exportPathForIndex}';`;
  tree.write(indexFilePath, newContents);

  if (options.lintCommandName) {
    return /* istanbul ignore next */ () =>
      runLint(options.projectName, options.lintCommandName);
  }
}

export default repositoryGenerator;
