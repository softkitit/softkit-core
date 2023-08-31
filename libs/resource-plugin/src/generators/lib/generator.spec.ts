import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { libGenerator } from './generator';
import { LibGeneratorSchema } from './schema';

describe('lib generator', () => {
  let tree: Tree;
  const options: LibGeneratorSchema = {
    name: 'test',
    config: true,
    languages: ['en', 'de'],
    buildable: true,
    i18n: true,
    unitTestRunner: 'jest',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await libGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');

    const fileChanges = tree.listChanges();
    expect(fileChanges.length).toEqual(24);

    const i18nFiles = fileChanges.filter((path) => path.path.includes('i18n'));

    expect(i18nFiles.length).toEqual(4);

    const configFile = fileChanges.find((path) =>
      path.path.includes('config/test.config.ts'),
    );

    expect(configFile).toBeDefined();
    expect(configFile.type).toBe('CREATE');

    expect(config).toBeDefined();
  });

  it('should generate lib without config', async () => {
    await libGenerator(tree, {
      ...options,
      config: false,
    });
    const config = readProjectConfiguration(tree, 'test');

    const fileChanges = tree.listChanges();
    expect(fileChanges.length).toEqual(23);

    const i18nFiles = fileChanges.filter((path) => path.path.includes('i18n'));

    expect(i18nFiles.length).toEqual(4);

    const configFile = fileChanges.find((path) =>
      path.path.includes('config/test.config.ts'),
    );

    expect(configFile).toBeUndefined();

    expect(config).toBeDefined();
  });

  it('should generate lib without i18n', async () => {
    await libGenerator(tree, {
      ...options,
      i18n: false,
    });
    const config = readProjectConfiguration(tree, 'test');

    const fileChanges = tree.listChanges();
    expect(fileChanges.length).toEqual(20);

    const i18nFiles = fileChanges.filter((path) => path.path.includes('i18n'));

    expect(i18nFiles.length).toEqual(0);

    const configFile = fileChanges.find((path) =>
      path.path.includes('config/test.config.ts'),
    );

    expect(configFile).toBeDefined();
    expect(configFile.type).toBe('CREATE');

    expect(config).toBeDefined();
  });

  it.each([
    'library.name',
    'LibraryName',
    'LIBRARY_NAME',
    'Library-Name',
    'library-name',
    'libraryName',
    'library name',
    'Library Name',
  ])('various cases for library name - (%s)', async (libraryName) => {
    await libGenerator(tree, {
      ...options,
      name: libraryName,
    });
    const config = readProjectConfiguration(tree, 'library-name');

    expect(config).toBeDefined();

    const fileChanges = tree.listChanges();
    expect(fileChanges.length).toEqual(24);

    const configFile = fileChanges.find((path) =>
      path.path.includes('config/library-name.config.ts'),
    );

    expect(configFile).toBeDefined();
    expect(configFile.type).toBe('CREATE');
  });
});
