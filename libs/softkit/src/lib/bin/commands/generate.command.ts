/* eslint-disable  unicorn/no-process-exit */
import yargs from 'yargs';
import { appRootPath } from '../../utils/file/app-root-path';
import { setVerbose } from '../../utils/env';
import { flushChanges, FsTree, printChanges, Tree } from '../../service/tree';
import { detectPackageManager } from '../../utils/package-manager';
import { WorkspaceContext } from '../../utils/app-context/vo/app-environment.context';
import { detectMonorepoManager, getListOfApps } from '../../utils/monorepo';
import { AppContext } from '../../utils/app-context/vo/app-context';
import process from 'node:process';
import { logger } from '../../utils/logger';
import {
  getAllPlugins,
  getGeneratorImplementation,
  parseGeneratorString,
  promptForGeneratorIfNeeded,
  validateGeneratorInputs,
} from '../../utils/generator/utils';
import { PACKAGE_JSON_FILE_NAME } from '../../vo/constants';

export interface GenerateCommandOptions {
  generator?: string;
  app?: string;
  dryRun: boolean;
  verbose: boolean;
}

/**
 * Execute generator
 */
export class GenerateCommand
  implements yargs.CommandModule<object, GenerateCommandOptions>
{
  command = 'generate <generator> <app> [_..]';
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
      .positional('app', {
        describe: 'Name of the application folder if you use a monorepo',
        type: 'string',
        required: false,
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
    const fsTree: Tree = new FsTree(appRootPath());

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

    if (Object.keys(generatorsDefinition).length === 0) {
      logger.error(
        `Generators definition not found in ${plugin.packageJson.name} ${PACKAGE_JSON_FILE_NAME} file`,
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

    const generatorInputs = validateGeneratorInputs(
      generator.getInputs(),
      args,
    );

    const generatorCallback = await generator.generate(
      fsTree,
      workspaceConfig,
      generatorInputs,
    );

    flushChanges(fsTree.root, fsTree.listChanges());
    printChanges(fsTree.listChanges());

    if (generatorCallback) {
      await generatorCallback();
    }
  }
}
