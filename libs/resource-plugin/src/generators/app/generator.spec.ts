import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { appGenerator } from './generator';
import { AppGeneratorSchema } from './schema';

describe('app generator', () => {
  let tree: Tree;
  const options: AppGeneratorSchema = {
    name: 'test',
    title: 'Test',
    description: 'Test',
    i18n: true,
    languages: ['en', 'es', 'fr'],
    auth: true,
    health: true,
    e2eTestRunner: 'none',
    db: true,
    configureJestConfig: true,
    dbType: 'postgres',
    dbName: 'test',
    appPort: 3000,
    contactName: 'Test',
    contactEmail: '',
    contactUrl: '',
    testsFolderName: '__tests__',
    lintCommandName: 'lint',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it.each([
    [
      {
        i18n: false,
      },
      31,
    ],
    [
      {
        auth: false,
      },
      36,
    ],
    [
      {
        health: false,
      },
      36,
    ],
    [
      {
        db: false,
      },
      35,
    ],
    [
      {
        db: false,
        auth: false,
        languages: ['en'],
        i18n: false,
        health: false,
      },
      30,
    ],
  ])(
    'without feature: %s',
    async (option: Partial<AppGeneratorSchema>, expectedNumber: number) => {
      const modifiedOptions = {
        ...options,
        ...option,
      };

      await appGenerator(tree, modifiedOptions);

      expect(tree.listChanges().length).toBe(expectedNumber);
    },
  );

  it('should generate application successfully', async () => {
    await appGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();

    const listChanges = tree.listChanges();

    expect(listChanges.length).toBe(36);

    const allDbFiles = listChanges.filter(
      (c) => c.path.includes('/database/') || c.path.includes('/repositories/'),
    );

    expect(allDbFiles.length).toBe(3);

    const i18nFiles = listChanges.filter((c) => c.path.includes('i18n'));

    expect(i18nFiles.length).toBe(5);

    const assetsFiles = listChanges.filter((c) => c.path.includes('/assets/'));

    expect(assetsFiles.length).toBe(2);

    const resourcesFiles = listChanges.filter((c) =>
      c.path.includes('/resources/'),
    );

    expect(resourcesFiles.length).toBe(2);

    const testFiles = listChanges.filter((c) => c.path.includes('/__tests__/'));

    expect(testFiles.length).toBe(1);
  });
});
