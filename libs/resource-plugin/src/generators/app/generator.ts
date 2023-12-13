import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';

import { AppGeneratorSchema } from './schema';
import { paramCase, pascalCase, snakeCase } from 'change-case';
import i18nGenerator from '../i18n/generator';
import { runLint } from '../common/run-lint';
import { EOL } from 'node:os';
import { existsSync, readFileSync } from 'node:fs';

function updateProjectJson(
  tree: Tree,
  options: AppGeneratorSchema,
  appRoot: string,
) {
  updateJson(tree, joinPathFragments(appRoot, 'project.json'), (prjJson) => {
    // if scripts is undefined, set it to an empty object
    prjJson.targets.build.options.assets = [
      ...prjJson.targets.build.options.assets,
      {
        glob: '**/*',
        input: `apps/${options.name}/src/app/assets`,
        output: 'assets',
      },
    ];

    prjJson.targets['generate-client'] = {
      executor: 'nx:run-commands',
      options: {
        commands: [
          `openapi-generator-cli generate -i ./apps/${options.name}/resources/openapi-docs.json -g typescript-axios -o libs/clients/${options.name}-client/src/lib/generated -c ./apps/${options.name}/resources/openapi-server-generator.config.yaml`,
        ],
      },
    };

    prjJson.targets.build.options.tsPlugins = [
      ...(prjJson.targets.build.options.tsPlugins || []),
      {
        name: '@nestjs/swagger/plugin',
        options: {
          dtoFileNameSuffix: [options.db ? '.entity.ts' : '', '.dto.ts'].filter(
            (value) => value !== '',
          ),
          controllerFileNameSuffix: ['.controller.ts'],
          classValidatorShim: true,
          dtoKeyOfComment: 'description',
          controllerKeyOfComment: 'description',
          introspectComments: true,
        },
      },
    ];

    return prjJson;
  });
}

function updateTSConfig(tree: Tree, appRoot: string) {
  const tsConfigFilePath = joinPathFragments(appRoot, 'tsconfig.spec.json');
  const tsConfigContent = tree.read(tsConfigFilePath, 'utf8');

  const tsConfig = JSON.parse(tsConfigContent);

  const defaultPathToGlobalDts = '../../global.d.ts';
  const globalDtsPath = joinPathFragments(appRoot, defaultPathToGlobalDts);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(globalDtsPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const fileContent = readFileSync(globalDtsPath, 'utf8');
    if (!fileContent.includes('/// <reference types="jest-extended" />')) {
      throw new Error(
        `Looks like a developer mistake. "global.d.ts" found, but it does not contain the required reference. Please ensure it includes: /// <reference types="jest-extended" />`,
      );
    }
  } else {
    throw new Error(
      'Looks like a developer mistake. "global.d.ts" is missing at the default path "../../global.d.ts". This file is essential for the correct Jest setup and must include the following content: /// <reference types="jest-extended" />',
    );
  }
  tsConfig.include.push(defaultPathToGlobalDts);

  const updatedTsConfigContent = JSON.stringify(tsConfig, undefined, 2);
  tree.write(tsConfigFilePath, updatedTsConfigContent);
}

function setupJestConfiguration(tree: Tree, appRoot: string) {
  const jestConfigPath = joinPathFragments(appRoot, 'jest.config.ts');
  const jestSetupFilePath = joinPathFragments(appRoot, 'jest.setup.js');

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

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  options.name = paramCase(options.name);
  const srcFolder = joinPathFragments(options.name, 'src');

  await applicationGenerator(tree, options);

  const appRoot = readProjectConfiguration(tree, options.name).root;

  const allFilesInSrc = tree
    .listChanges()
    .filter((c) => c.path.includes(srcFolder));

  for (const f of allFilesInSrc) {
    tree.delete(f.path);
  }

  setupJestConfiguration(tree, appRoot);
  updateTSConfig(tree, appRoot);

  const generatorFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, generatorFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
  });

  if (!options.db) {
    const dbFiles = tree
      .listChanges()
      .filter(
        (c) => c.path.includes('/db/') || c.path.includes('/repositories/'),
      );

    for (const c of dbFiles) tree.delete(c.path);
  }

  if (options.i18n) {
    await i18nGenerator(tree, {
      ...options,
      buildable: true,
      baseFolder: 'app',
    });
  }
  updateProjectJson(tree, options, appRoot);

  if (options.lintCommandName) {
    return /* istanbul ignore next */ () =>
      runLint(options.name, options.lintCommandName);
  }
}

export default appGenerator;
