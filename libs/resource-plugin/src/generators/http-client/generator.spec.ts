import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readProjectConfiguration, Tree } from '@nx/devkit';

import { HttpClientGeneratorSchema } from './schema';
import httpClientGenerator from './generator';

describe('http-client generator', () => {
  let tree: Tree;
  const options: HttpClientGeneratorSchema = {
    name: 'test',
    directory: 'clients',
    importPath: '@softkit/nestjs-http-client',
    lintCommandName: 'lint',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it.each([
    [{}],
    [
      {
        importPath: 'nestjs-http-client',
      },
    ],
  ])('should run successfully: %s', async (inputCase) => {
    const updatedOptions = {
      ...options,
      ...inputCase,
    };

    await httpClientGenerator(tree, updatedOptions);
    const config = readProjectConfiguration(
      tree,
      `${updatedOptions.directory}-${updatedOptions.name}`,
    );
    expect(config).toBeDefined();
    expect(tree.listChanges()).toHaveLength(23);
  });
});
