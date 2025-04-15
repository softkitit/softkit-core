import yargs from 'yargs';

/**
 * Execute initialization
 */
export class InitCommand implements yargs.CommandModule {
  command = 'init';
  describe = 'Init SK repository';

  async handler() {}
}
