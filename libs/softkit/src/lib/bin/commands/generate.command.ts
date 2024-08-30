/* eslint-disable  unicorn/no-process-exit */
import yargs from 'yargs';
import { appRootPath } from '../../utils/file/app-root-path';
import { setVerbose } from '../../utils/env';
import { FsTree } from '../../service/tree';
import { findPlugins, getImplementationFactory } from '../../utils/plugins';
import { detectPackageManager } from '../../utils/package-manager';
import { WorkspaceContext } from '../../utils/app-context/vo/app-environment.context';
import { detectMonorepoManager, getListOfApps } from '../../utils/monorepo';
import { AppContext } from '../../utils/app-context/vo/app-context';
import { PluginInfo } from '../../utils/plugins/vo/plugin-info';
import enquirer = require('enquirer');
import process from 'node:process';
import { logger } from '../../utils/logger';
import { Generator } from '../../utils/generator/vo/generator';
import { validateAndConvert } from '../../utils/generator/vo/validation';
import { GeneratorOption } from '../../utils/generator/vo/generator-option';

export interface GenerateCommandOptions {
  generator?: string;
  dryRun: boolean;
  verbose: boolean;
}

/**
 * Execute generator
 */
export class GenerateCommand
  implements yargs.CommandModule<object, GenerateCommandOptions>
{
  command = 'generate <generator> [_..]';
  aliases = ['g', 'gen'];
  describe = 'Execute SK generator';

  builder(args: yargs.Argv<object>): yargs.Argv<GenerateCommandOptions> {
    return args
      .epilog(
        `Run "sk g collection:generator --help" to see information about the generator's schema.`,
      )
      .help(false)
      .positional('generator', {
        describe: 'Name of the generator (e.g., @softkit/nestjs:library)',
        type: 'string',
        required: true,
      })
      .option('dryRun', {
        describe: 'Preview the changes without updating files',
        alias: 'd',
        type: 'boolean',
        default: false,
      })
      .option('verbose', {
        describe:
          'Prints additional information about the commands (e.g., stack traces)',
        type: 'boolean',
        default: false,
      });
  }

  async handler(args: yargs.ArgumentsCamelCase<GenerateCommandOptions>) {
    // Remove the command from the args
    args._ = args._.slice(1);

    if (args['verbose']) {
      setVerbose(true);
    }

    const generatorOptions = parseGeneratorString(args.generator!);
    const fsTree = new FsTree(appRootPath());

    const packageManager = detectPackageManager(fsTree);
    const monorepoManager = detectMonorepoManager(fsTree, packageManager);
    const apps: AppContext[] = await getListOfApps(monorepoManager);

    const workspaceConfig: WorkspaceContext = {
      monorepoManager,
      apps,
      packageManager,
    };

    const installedPlugins = getAllPlugins(apps);

    const plugin = installedPlugins.find(
      (plugin) => plugin.packageJson.name === generatorOptions.module,
    );

    if (!plugin) {
      logger.error(
        `Plugin ${generatorOptions.module} not found, maybe you need to install it first.`,
      );
      return process.exit(0);
    }

    const generatorsDefinition = plugin.packageJson.sk.generators;

    if (
      !generatorsDefinition ||
      Object.keys(generatorsDefinition).length === 0
    ) {
      logger.error(
        `Generators definition not found in ${plugin.packageJson.name} package.json file`,
      );
      return process.exit(1);
    }

    generatorOptions.generator ??= await promptForGeneratorIfNeeded(
      generatorOptions,
      generatorsDefinition,
      plugin,
    );

    const generator = getGeneratorImplementation(
      generatorsDefinition[generatorOptions.generator],
      plugin,
    );

    const generatorField = generator.getInputs();
    const generatorInputs = validateGeneratorInputs(generatorField, args);

    await generator.generate(fsTree, workspaceConfig, generatorInputs);

    const fileChanges = fsTree.listChanges();
    logger.info(`Files to be created/updated: ${fileChanges}`);
  }
}

function getAllPlugins(apps: AppContext[]) {
  return [
    ...findPlugins(),
    ...apps.map((app) =>
      app.hasBuiltInPlugin
        ? {
            path: app.path,
            packageJson: app.packageJson,
            local: true,
          }
        : undefined,
    ),
  ]
    .filter((plugin): plugin is PluginInfo => !!plugin)
    .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name));
}

async function promptForGeneratorIfNeeded(
  generator: {
    module: string;
    generator?: string;
  },
  generatorsDefinition: Record<string, string> & string,
  plugin: PluginInfo,
): Promise<string> {
  if (
    generator.generator === undefined ||
    !generatorsDefinition[generator.generator]
  ) {
    const generatorPrompt = await enquirer.prompt<{ generator: string }>([
      {
        name: 'generator',
        message: `Select a generator from ${plugin.packageJson.name} plugin:`,
        type: 'autocomplete',
        choices: Object.keys(generatorsDefinition).map((generator) => ({
          name: generator,
        })),
        initial: 0,
      },
    ]);
    return generatorPrompt.generator;
  } else {
    return generator.generator;
  }
}

function parseGeneratorString(value: string): {
  module: string;
  generator?: string;
} {
  const separatorIndex = value.lastIndexOf(':');

  return separatorIndex > 0
    ? {
        module: value.slice(0, separatorIndex),
        generator: value.slice(separatorIndex + 1),
      }
    : {
        module: value,
      };
}

function validateGeneratorInputs(
  generatorField: GeneratorOption[],
  args: {
    generator?: string;
    dryRun: boolean;
    verbose: boolean;
  } & { _: Array<string | number>; $0: string; [p: string]: unknown },
) {
  const generatorInputs: Record<string, unknown> = {};

  for (const field of generatorField) {
    let value = args[field.name] as string | string[];

    const requiredField = field.validation?.required ?? true;

    if (requiredField && !value) {
      //   todo prompt for value here
      value = 'smth';
    }

    const convertedValue = validateAndConvert(
      field.name,
      value,
      field.type,
      field.validation,
    );

    generatorInputs[field.name] = convertedValue;
  }
  return generatorInputs;
}

function getGeneratorImplementation(
  generatorImplementation: string,
  plugin: PluginInfo,
) {
  const implementationFactory = getImplementationFactory<{
    new (...args: unknown[]): Generator<unknown>;
  }>(generatorImplementation, plugin.path);

  const GeneratorFactory = implementationFactory();
  return new GeneratorFactory();
}
