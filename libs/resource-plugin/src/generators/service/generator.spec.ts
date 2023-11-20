import { Tree, readProjectConfiguration } from '@nx/devkit';

import { serviceGenerator } from './generator';
import { ServiceGeneratorSchema } from './schema';
import { pascalCase } from 'change-case';
import { createTreeWithNestApplication } from '@nx/nest/src/generators/utils/testing';
import { EOL } from 'node:os';

describe('service generator', () => {
  let tree: Tree;
  const options: ServiceGeneratorSchema = {
    projectName: 'test-project',
    serviceName: 'test-service',
    repositoryName: 'test-repo',
    entityName: 'test-entity',
    groupName: 'test',
    tenantBaseService: true,
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(options.projectName);
  });

  it(`should create a service and update or create index.ts if it doesn't exists`, async () => {
    const changesBeforeGeneratorRun = [...tree.listChanges()];
    await serviceGenerator(tree, options);
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
    expect(indexTsFile.content.toString()).toContain(options.serviceName);
    // group name should be a folder in the path
    expect(indexTsFile.content.toString()).toContain(`/${options.groupName}/`);

    const serviceFile = changesAfterGenerator.find((change) => {
      return change.path.includes(options.serviceName);
    });

    expect(serviceFile.path).toContain(`/${options.groupName}/`);
    expect(serviceFile).toBeDefined();
    expect(serviceFile.content.toString()).toContain(
      pascalCase(options.entityName),
    );
    expect(serviceFile.content.toString()).toContain(
      pascalCase(options.repositoryName),
    );

    await serviceGenerator(tree, {
      ...options,
      serviceName: 'second-service',
    });

    const indexFile = tree.listChanges().find((change) => {
      return change.path.includes('index.ts');
    });

    expect(indexFile.content.toString().split(EOL).length).toBe(3);
  });
});
