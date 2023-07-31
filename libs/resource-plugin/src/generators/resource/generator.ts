import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { EOL } from 'node:os';
import { ResourceGeneratorSchema } from './schema';
import { pascalCase, snakeCase } from 'change-case';
import {} from 'node:child_process';
import repositoryGenerator from '../repository/generator';
import { RepositoryGeneratorSchema } from '../repository/schema';

export async function resourceGenerator(
  tree: Tree,
  options: ResourceGeneratorSchema,
) {
  const appRoot = readProjectConfiguration(tree, options.projectName).root;

  const srcFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, srcFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
  });

  const entitiesFolder = joinPathFragments(
    appRoot,
    'src/app/database/entities',
  );
  const groupName = options.groupName || '';

  const exportPathForIndex = joinPathFragments(
    groupName,
    `${options.entityName}.entity`,
  );

  const indexFilePath = joinPathFragments(entitiesFolder, `index.ts`);

  const contents = tree.exists(indexFilePath)
    ? tree.read(indexFilePath).toString()
    : '';
  const newContents = `${contents}${EOL}export * from './${exportPathForIndex}';`;
  tree.write(indexFilePath, newContents);
  //   todo run eslint --fix

  if (options.generateRepository) {
    const repositoryOptions = {
      ...options,
      tenantBaseRepository: options.tenantBaseEntity,
      repositoryName: `${options.entityName}`,
    } satisfies RepositoryGeneratorSchema;
    await repositoryGenerator(tree, repositoryOptions);
  }
}

export default resourceGenerator;
