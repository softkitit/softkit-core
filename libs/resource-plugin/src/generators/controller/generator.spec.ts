import {
  Tree,
  readProjectConfiguration,
  writeJson,
  joinPathFragments,
} from '@nx/devkit';

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
    controllerName: 'test',
    entityName: 'test-entity',
    basePath: 'api/test-project',
    tenantBaseEntity: true,
    entityIncludesIdField: true,
    entityIncludesVersionField: true,
    groupName: 'test',
  };
  const newPermissionsCategory = {
    categoryName: 'test2',
    categoryDescription: 'Test31 management',
    permissions: [
      {
        name: 'Create Test',
        description: 'Create Test',
        action: 'test-project.test.create',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        name: 'Read Test',
        description: 'Read Test',
        action: 'test-project.test.read',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        name: 'Update Test',
        description: 'Update Test',
        action: 'test-project.test.update',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        name: 'Delete Test',
        description: 'Delete Test',
        action: 'test-project.test.delete',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(options.projectName);
  });

  it('should create controller, dto file and update or create index.ts, with options: %s', async () => {
    const changesBeforeGeneratorRun = [...tree.listChanges()];
    await controllerGenerator(tree, {
      ...options,
    });
    const config = readProjectConfiguration(tree, options.projectName);
    expect(config).toBeDefined();

    const changesAfterGenerator = tree
      .listChanges()
      .slice(changesBeforeGeneratorRun.length);

    // this generator should create 2 files and modify one
    expect(changesAfterGenerator.length).toBe(6);

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
        change.path.includes('controller.ts')
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

    // generate third controller with existing permission
    options.groupName = '';
    const permissionsFile = joinPathFragments(
      options.projectName,
      'src/app/assets/migrations/permissions.json',
    );

    writeJson(tree, permissionsFile, [newPermissionsCategory]);

    await controllerGenerator(tree, {
      ...options,
      controllerName: 'third-controller',
    });
  });
});
