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
    auth: true,
    health: true,
    e2eTestRunner: 'none',
    db: true,
    dbType: 'postgres',
    dbName: 'test',
    appPort: 3000,
    contactName: 'Test',
    contactEmail: '',
    contactUrl: '',
    testsFolderName: '__tests__',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it.each([
    [
      {
        i18n: false,
      },
      29,
    ],
    [
      {
        auth: false,
      },
      31,
    ],
    [
      {
        health: false,
      },
      31,
    ],
    [
      {
        db: false,
      },
      28,
    ],
    [
      {
        db: false,
        auth: false,
        i18n: false,
        health: false,
      },
      26,
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

    expect(listChanges.length).toBe(31);

    const allDbFiles = listChanges.filter(
      (c) => c.path.includes('/db/') || c.path.includes('/repositories/'),
    );

    expect(allDbFiles.length).toBe(3);

    const i18nFiles = listChanges.filter((c) => c.path.includes('i18n'));

    expect(i18nFiles.length).toBe(2);

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
