import yargs from 'yargs';
import { logger } from '../../utils/logger';

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

    logger.log(args._);
    logger.log(args);
  }
}
