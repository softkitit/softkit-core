import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { EOL } from 'node:os';
import { ResourceGeneratorSchema } from './schema';
import { pascalCase, snakeCase } from 'change-case';
import repositoryGenerator from '../repository/generator';
import { RepositoryGeneratorSchema } from '../repository/schema';
import serviceGenerator from '../service/generator';
import { ServiceGeneratorSchema } from '../service/schema';
import controllerGenerator from '../controller/generator';
import { ControllerGeneratorSchema } from '../controller/schema';
import { runLint } from '../common/run-lint';

export async function resourceGenerator(
  tree: Tree,
  options: ResourceGeneratorSchema,
) {
  const appRoot = readProjectConfiguration(tree, options.projectName).root;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lintCommandName, ...optionsWithoutLintCommand } = options;

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

  const entityFileName = `${options.entityName}.entity`;
  const exportPathForIndex = joinPathFragments(
    options.groupName,
    entityFileName,
  );

  const indexFilePath = joinPathFragments(entitiesFolder, `index.ts`);

  const contents = tree.exists(indexFilePath)
    ? tree.read(indexFilePath).toString()
    : '';
  const newContents = `${contents}${EOL}export * from './${exportPathForIndex}';`;
  tree.write(indexFilePath, newContents);

  if (options.generateRepository) {
    const repositoryOptions = {
      ...optionsWithoutLintCommand,
      tenantBaseRepository: options.tenantBaseEntity,
      repositoryName: `${options.entityName}`,
    } satisfies RepositoryGeneratorSchema;
    await repositoryGenerator(tree, repositoryOptions);
  }

  if (options.generateService) {
    const repositoryOptions = {
      ...optionsWithoutLintCommand,
      tenantBaseService: options.tenantBaseEntity,
      repositoryName: `${options.entityName}`,
      serviceName: options.entityName,
    } satisfies ServiceGeneratorSchema;
    await serviceGenerator(tree, repositoryOptions);
  }

  if (options.generateController) {
    const repositoryOptions = {
      ...optionsWithoutLintCommand,
      serviceName: options.entityName,
      controllerName: options.entityName,
    } satisfies ControllerGeneratorSchema;
    await controllerGenerator(tree, repositoryOptions);
  }

  /* istanbul ignore next */ if (lintCommandName) {
    return () => runLint(options.projectName, lintCommandName);
  }
}

export default resourceGenerator;
