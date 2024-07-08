import { cloneRepo } from '../common/clone-repo';
import yargs from 'yargs';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

interface GenerateBoilerplateArguments {
  appFolder: string;
  companyName: string;
  tag: string;
  repository: string;
}

function updatePackageJson(root: string, companyName: string) {
  const packageJsonPath = join(root, 'package.json');

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = `@${companyName}/source`;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
}

export class BoilerplateGeneratorCommand
  implements yargs.CommandModule<object, GenerateBoilerplateArguments>
{
  command = 'boilerplate-generator';
  describe = 'Generate a new boilerplate project.';

  builder(args: yargs.Argv<object>): yargs.Argv<GenerateBoilerplateArguments> {
    return args
      .option('appFolder', {
        alias: 'f',
        type: 'string',
        describe: 'The folder for the application',
        demandOption: true,
      })
      .option('companyName', {
        alias: 'c',
        type: 'string',
        describe: 'The name of the company',
        demandOption: true,
      })
      .option('tag', {
        alias: 't',
        type: 'string',
        describe: 'The git tag to use',
        default: 'latest',
        demandOption: false,
      })
      .option('repository', {
        alias: 'r',
        type: 'string',
        describe: 'The git repository URL',
        demandOption: false,
        default: 'https://github.com/softkitit/softkit-nestjs-boilerplate.git',
      });
  }

  handler = async (argv: yargs.Arguments<GenerateBoilerplateArguments>) => {
    const root = argv.appFolder;
    const companyName = argv.companyName.toLowerCase().trim();
    await cloneRepo(root, argv.tag, argv.repository);

    updatePackageJson(root, companyName);
  };
}
