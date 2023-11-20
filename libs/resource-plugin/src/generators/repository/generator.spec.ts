import { Tree, readProjectConfiguration } from '@nx/devkit';

import { repositoryGenerator } from './generator';
import { RepositoryGeneratorSchema } from './schema';
import { createTreeWithNestApplication } from '@nx/nest/src/generators/utils/testing';
import { pascalCase } from 'change-case';
import { EOL } from 'node:os';

describe('repository generator', () => {
  let tree: Tree;
  const options: RepositoryGeneratorSchema = {
    projectName: 'test-project',
    entityName: 'test-entity',
    repositoryName: 'test-repo',
    groupName: 'test-group',
    tenantBaseRepository: true,
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(options.projectName);
  });

  it('should create repository and export it in index.ts file', async () => {
    const changesBeforeGeneratorRun = [...tree.listChanges()];
    await repositoryGenerator(tree, options);
    const config = readProjectConfiguration(tree, options.projectName);
    expect(config).toBeDefined();

    const changesAfterGenerator = tree
      .listChanges()
      .slice(changesBeforeGeneratorRun.length);

    // this generator should create 2 files
    expect(changesAfterGenerator.length).toBe(2);

    const indexTsFile = changesAfterGenerator.find((change) => {
      return change.path.includes('index');
    });

    expect(indexTsFile).toBeDefined();
    expect(indexTsFile.content.toString()).toContain(options.repositoryName);
    // group name should be a folder in the path
    expect(indexTsFile.content.toString()).toContain(`/${options.groupName}/`);

    const repositoryFile = changesAfterGenerator.find((change) => {
      return change.path.includes(options.repositoryName);
    });

    expect(repositoryFile.path).toContain(`/${options.groupName}/`);
    expect(repositoryFile).toBeDefined();
    expect(repositoryFile.content.toString()).toContain(
      pascalCase(options.entityName),
    );

    await repositoryGenerator(tree, {
      ...options,
      repositoryName: 'second-repository',
    });

    const fileChange = tree.listChanges().find((change) => {
      return change.path.includes('index.ts');
    });

    expect(fileChange.content.toString().split(EOL).length).toBe(3);
  });
});
