import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { i18nGenerator } from './generator';
import { I18nGeneratorSchema } from './schema';
import { libraryGenerator, applicationGenerator } from '@nx/nest';

describe('i18n generator', () => {
  let tree: Tree;
  const appTypes: string[] = ['apps', 'libs'];
  const options: I18nGeneratorSchema = {
    name: 'test',
    baseFolder: 'libs',
    buildable: false,
    languages: ['en', 'de', 'fr'],
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  for (const generationType of appTypes) {
    it.each([
      [
        {
          buildable: true,
          languages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh'],
        },
        10,
      ],
      [
        {
          buildable: false,
          languages: ['en'],
        },
        3,
      ],
      [
        {
          buildable: true,
          languages: ['en'],
        },
        3,
      ],
      [{}, 5],
    ])(
      `should run for ${generationType} with various configs %s`,
      async (
        additionalOptions: Partial<I18nGeneratorSchema>,
        expectedFileCount: number,
      ) => {
        const updatedOptions = {
          ...options,
          ...additionalOptions,
        };

        if (generationType === 'apps') {
          await applicationGenerator(tree, {
            ...updatedOptions,
          });
        } else if (generationType === 'libs') {
          await libraryGenerator(tree, updatedOptions);
        }
        const numberOfChangesBeforeI18n = tree.listChanges().length;
        await i18nGenerator(tree, updatedOptions);
        const fileChangesAfterI18nGeneration = tree.listChanges();

        expect(
          fileChangesAfterI18nGeneration.length - numberOfChangesBeforeI18n,
        ).toBe(expectedFileCount);
        const config = readProjectConfiguration(tree, 'test');
        expect(config).toBeDefined();
      },
    );
  }
});
