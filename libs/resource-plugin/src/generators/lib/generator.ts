import {
  generateFiles,
  joinPathFragments,
  logger,
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
import { existsSync, readFileSync } from 'node:fs';

export async function libGenerator(tree: Tree, options: LibGeneratorSchema) {
  options.name = paramCase(options.name);

  await libraryGenerator(tree, {
    ...options,
  });

  const libRoot = readProjectConfiguration(tree, options.name).root;

  setupJestConfiguration(tree, libRoot);
  updateTSConfig(tree, libRoot);

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

function updateTSConfig(tree: Tree, libRoot: string) {
  const tsConfigFilePath = joinPathFragments(libRoot, 'tsconfig.spec.json');

  const defaultPathToGlobalDts = '../../global.d.ts';
  const globalDtsPath = joinPathFragments(libRoot, defaultPathToGlobalDts);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(globalDtsPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const fileContent = readFileSync(globalDtsPath, 'utf8');
    if (!fileContent.includes('/// <reference types="jest-extended" />')) {
      logger.warn(
        `Looks like a developer mistake. "global.d.ts" found, but it does not contain the required reference. Please ensure it includes: /// <reference types="jest-extended" />`,
      );
    }
  } else {
    logger.warn(
      'Looks like a developer mistake. "global.d.ts" is missing at the default path "../../global.d.ts". This file is essential for the correct Jest setup and must include the following content: /// <reference types="jest-extended" />',
    );
  }

  const tsConfigContent = tree.read(tsConfigFilePath, 'utf8');
  const tsConfig = JSON.parse(tsConfigContent);
  tsConfig.include.push(defaultPathToGlobalDts);

  const updatedTsConfigContent = JSON.stringify(tsConfig, undefined, 2);
  tree.write(tsConfigFilePath, updatedTsConfigContent);
}

function setupJestConfiguration(tree: Tree, libRoot: string) {
  const jestConfigPath = joinPathFragments(libRoot, 'jest.config.ts');
  const jestSetupFilePath = joinPathFragments(libRoot, 'jest.setup.js');

  const jestSetupContent = `const matchers = require('jest-extended');
expect.extend(matchers);
`;

  tree.write(jestSetupFilePath, jestSetupContent);

  const jestConfigContent = tree.read(jestConfigPath, 'utf8');
  const fileConfig = jestConfigContent.split(EOL);

  const newJestConfigFile = [
    ...fileConfig.slice(0, -3),
    `  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],`,
    `  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],`,
    ...fileConfig.slice(-3),
  ].join(EOL);

  tree.write(jestConfigPath, newJestConfigFile);
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
