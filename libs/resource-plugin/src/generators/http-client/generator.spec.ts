import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { httpClientGenerator } from './generator';
import { HttpClientGeneratorSchema } from './schema';

describe('http-client generator', () => {
  let tree: Tree;
  const options: HttpClientGeneratorSchema = {
    name: 'test',
    directory: 'clients',
    importPath: '@softkit/nestjs-http-client',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await httpClientGenerator(tree, options);
    const config = readProjectConfiguration(
      tree,
      `${options.directory}-${options.name}`,
    );
    expect(config).toBeDefined();
    expect(tree.listChanges()).toHaveLength(22);
  });
});
