import yargs from 'yargs';
import { BoilerplateGeneratorCommand } from '../generate-boilerplate.command';

yargs
  .command(new BoilerplateGeneratorCommand())
  .strict()
  .help('h')
  .alias('h', 'help').argv;
