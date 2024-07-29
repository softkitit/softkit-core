import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateJson,
  workspaceRoot,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';

import { AppGeneratorSchema } from './schema';
import { paramCase, pascalCase, snakeCase } from 'change-case';
import i18nGenerator from '../i18n/generator';
import { runLint } from '../common/run-lint';
import { EOL } from 'node:os';
import { updateTypeScriptConfigurations } from '../common/update-ts-configurations';

function updateProjectJson(
  tree: Tree,
  options: AppGeneratorSchema,
  appRoot: string,
) {
  updateJson(tree, joinPathFragments(appRoot, 'project.json'), (prjJson) => {
    // if scripts is undefined, set it to an empty object
    prjJson.targets.build.options.main = `apps/${options.name}/src/app/main.ts`;

    prjJson.targets.build.options.assets[0] = `apps/${options.name}/src/app/assets`;
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

function setupJestConfiguration(
  tree: Tree,
  appRoot: string,
  configureJestConfig: boolean,
) {
  const jestConfigPath = joinPathFragments(appRoot, 'jest.config.ts');

  if (configureJestConfig) {
    const jestSetupFilePath = joinPathFragments(appRoot, 'jest.setup.js');

    const jestSetupContent = `const matchers = require('jest-extended');
expect.extend(matchers);
`;

    tree.write(jestSetupFilePath, jestSetupContent);
  }

  const jestConfigContent = tree.read(jestConfigPath, 'utf8');
  const fileConfig = jestConfigContent.split(EOL);

  const newConfigLines = [
    ...fileConfig.slice(0, -3),
    `  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],`,
  ];

  if (configureJestConfig) {
    newConfigLines.push(`  setupFilesAfterEnv: ['../../jest.setup.js'],`);
  }

  const newJestConfigFile = [...newConfigLines, ...fileConfig.slice(-3)].join(
    EOL,
  );

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

  setupJestConfiguration(tree, appRoot, options.configureJestConfig);

  if (options.configureJestConfig) {
    updateTypeScriptConfigurations(tree, appRoot, workspaceRoot);
  }

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
