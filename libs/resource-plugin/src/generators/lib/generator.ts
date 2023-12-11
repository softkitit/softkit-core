import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';
import { LibGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/nest';
import { paramCase, pascalCase } from 'change-case';
import i18nGenerator from '../i18n/generator';
import { runLint } from '../common/run-lint';
import { EOL } from 'node:os';

export async function libGenerator(tree: Tree, options: LibGeneratorSchema) {
  options.name = paramCase(options.name);

  await libraryGenerator(tree, {
    ...options,
  });

  const libRoot = readProjectConfiguration(tree, options.name).root;

  updateJestConfig(tree);

  if (options.config) {
    const configFolder = joinPathFragments(__dirname, './files/config');

    generateFiles(tree, configFolder, libRoot, {
      ...options,
      pascalCase,
    });
  }

  if (options.publishable) {
    updateProjectJson(tree, libRoot, options.name);
    updateEslintJson(tree, libRoot);
  }

  if (options.i18n) {
    await i18nGenerator(tree, {
      name: options.name,
      languages: options.languages,
      baseFolder: 'lib',
      buildable: options.buildable,
    });
  }

  if (options.lintCommandName) {
    return /* istanbul ignore next */ () =>
      runLint(options.name, options.lintCommandName);
  }
}

function updateJestConfig(tree: Tree) {
  const jestConfigFile = tree
    .listChanges()
    .find((c) => c.path.includes('jest.config.ts'));

  const fileConfig = jestConfigFile.content.toString().split(EOL);

  const newJestConfigFile = [
    ...fileConfig.slice(0, -3),
    `  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],`,
    ...fileConfig.slice(-3),
  ].join(EOL);

  tree.write(jestConfigFile.path, newJestConfigFile);
}

function updateEslintJson(tree: Tree, libRoot: string) {
  updateJson(
    tree,
    joinPathFragments(libRoot, '.eslintrc.json'),
    (eslintJson) => {
      eslintJson.overrides = [
        {
          files: ['{package,project}.json'],
          parser: 'jsonc-eslint-parser',
          rules: {
            '@nx/dependency-checks': [
              'error',
              {
                buildTargets: ['build'],
                checkMissingDependencies: true,
                checkObsoleteDependencies: true,
                checkVersionMismatches: true,
                ignoredDependencies: ['tslib'],
              },
            ],
          },
        },
        ...eslintJson.overrides,
      ];

      return eslintJson;
    },
  );
}

function updateProjectJson(tree: Tree, libRoot: string, name: string) {
  updateJson(tree, joinPathFragments(libRoot, 'project.json'), (prjJson) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { publish: _, ...other } = prjJson.targets;

    prjJson.targets = other;

    prjJson.targets.lint.options.lintFilePatterns = [
      ...prjJson.targets.lint.options.lintFilePatterns,
      `libs/${name}/project.json`,
    ];

    return prjJson;
  });
}

export default libGenerator;
