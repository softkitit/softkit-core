import { Tree, readProjectConfiguration } from '@nx/devkit';

import { controllerGenerator } from './generator';
import { ControllerGeneratorSchema } from './schema';
import { createTreeWithNestApplication } from '@nx/nest/src/generators/utils/testing';
import { pascalCase } from 'change-case';
import { EOL } from 'node:os';

describe('controller generator', () => {
  let tree: Tree;
  const options: ControllerGeneratorSchema = {
    projectName: 'test-project',
    serviceName: 'test-service',
    controllerName: 'test-controller',
    entityName: 'test-entity',
    tenantBaseEntity: true,
    groupName: 'test',
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(options.projectName);
  });

  it('should create controller without provided group name', async () => {
    await controllerGenerator(tree, {
      ...options,
      groupName: undefined,
    });

    const controllerFile = tree.listChanges().find((change) => {
      return (
        change.path.includes(options.controllerName) &&
        change.path.includes('controller')
      );
    });

    expect(controllerFile).toBeDefined();
  });

  it.each([{}, { groupName: 'test/test' }])(
    'should create controller, dto file and update or create index.ts, with options: %s',
    async (additionalOptions) => {
      const changesBeforeGeneratorRun = [...tree.listChanges()];
      await controllerGenerator(tree, {
        ...options,
        ...additionalOptions,
      });
      const config = readProjectConfiguration(tree, options.projectName);
      expect(config).toBeDefined();

      const changesAfterGenerator = tree
        .listChanges()
        .slice(changesBeforeGeneratorRun.length);

      // this generator should create 2 files and modify one
      expect(changesAfterGenerator.length).toBe(3);

      const indexTsFile = changesAfterGenerator.find((change) => {
        return change.path.includes('index');
      });

      expect(indexTsFile).toBeDefined();
      expect(indexTsFile.content.toString()).toContain(options.controllerName);
      // group name should be a folder in the path
      expect(indexTsFile.content.toString()).toContain(`${options.groupName}`);

      const controllerFile = changesAfterGenerator.find((change) => {
        return (
          change.path.includes(options.controllerName) &&
          change.path.includes('controller')
        );
      });

      expect(controllerFile).toBeDefined();
      expect(controllerFile.path).toContain(`/${options.groupName}/`);
      expect(controllerFile.content.toString()).toContain(
        pascalCase(options.entityName),
      );
      expect(controllerFile.content.toString()).toContain(
        pascalCase(options.serviceName),
      );

      const dtoFile = changesAfterGenerator.find((change) => {
        return (
          change.path.includes(options.controllerName) &&
          change.path.includes('dto')
        );
      });

      expect(dtoFile).toBeDefined();
      expect(dtoFile.path).toContain(`/${options.groupName}/vo/`);
      expect(controllerFile.content.toString()).toContain(
        pascalCase(options.entityName),
      );

      // generate second controller
      await controllerGenerator(tree, {
        ...options,
        controllerName: 'second-controller',
      });

      const changesAfterSecondGenerator = tree.listChanges().find((change) => {
        return change.path.includes('controllers/index.ts');
      });

      const indexFileContent = changesAfterSecondGenerator.content.toString();

      expect(indexFileContent.split(EOL).length).toBe(3);
    },
  );
});
