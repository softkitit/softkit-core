#!/usr/bin/env node
/* istanbul ignore file */
import 'reflect-metadata';
import yargs from 'yargs';
import { VersionCommand } from './bin/commands/version.command';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .recommendCommands()
  .command(new VersionCommand())
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;
