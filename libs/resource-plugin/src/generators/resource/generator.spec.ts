import { Tree, readProjectConfiguration } from '@nx/devkit';

import { resourceGenerator } from './generator';
import { ResourceGeneratorSchema } from './schema';
import { createTreeWithNestApplication } from '@nx/nest/src/generators/utils/testing';

describe('resource generator', () => {
  let tree: Tree;
  const options: ResourceGeneratorSchema = {
    projectName: 'test-project',
    entityName: 'test-entity',
    groupName: 'test-group',
    tenantBaseEntity: true,
    generateRepository: true,
    generateService: true,
    generateController: true,
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(options.projectName);
  });

  it('should creat 9 files for all embedded resources and appropriate folders', async () => {
    const changesBeforeGeneratorRun = [...tree.listChanges()];
    await resourceGenerator(tree, options);
    const config = readProjectConfiguration(tree, options.projectName);
    expect(config).toBeDefined();

    const changesAfterGenerator = tree
      .listChanges()
      .slice(changesBeforeGeneratorRun.length);

    // this generator should create 2 files
    expect(changesAfterGenerator.length).toBe(9);

    const indexTsFile = changesAfterGenerator.find((change) => {
      return change.path.includes('index');
    });

    expect(indexTsFile).toBeDefined();
    expect(indexTsFile.content.toString()).toContain(options.entityName);
    // group name should be a folder in the path
    expect(indexTsFile.content.toString()).toContain(`/${options.groupName}/`);

    const entityFile = changesAfterGenerator.find((change) => {
      return change.path.includes(options.entityName);
    });

    expect(entityFile.path).toContain(`/${options.groupName}/`);
    expect(entityFile).toBeDefined();
  });
});
