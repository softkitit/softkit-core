#!/usr/bin/env node
/* istanbul ignore file */
import 'reflect-metadata';
import yargs from 'yargs';
import { VersionCommand } from './bin/commands/version.command';
import { hideBin } from 'yargs/helpers';
import { GenerateCommand } from './bin/commands/generate.command';

// Ensure that the output takes up the available width of the terminal.
yargs.wrap(yargs.terminalWidth());

export const parserConfiguration: Partial<yargs.ParserConfigurationOptions> = {
  'strip-dashed': true,
};

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .parserConfiguration(parserConfiguration)
  .recommendCommands()
  .command(new GenerateCommand())
  .command(new VersionCommand())
  .demandCommand(1, 'You need at least one command before moving on')
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;
