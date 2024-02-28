const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('migrationsDir', {
    alias: 'm',
    describe: 'Path to the migrations directory',
    type: 'string',
  })
  .option('controllersDir', {
    alias: 'c',
    describe: 'Path to the controllers directory',
    type: 'string',
  })
  .option('libsDir', {
    alias: 'l',
    describe: 'Path to the libraries directory',
    type: 'string',
  })
  .option('assetsDir', {
    alias: 'a',
    describe: 'Path to the assets directory',
    type: 'string',
  }).argv;

async function updateIndexFile(migrationsDir) {
  if (migrationsDir.includes('dashboard')) {
    return;
  }

  const indexFile = path.join(migrationsDir, 'index.ts');

  try {
    const files = await fs.readdir(migrationsDir);

    const migrationFiles = files.filter(
      (file) => file.endsWith('.ts') && file !== 'index.ts',
    );

    const exports = migrationFiles
      .map((file) => {
        const moduleName = file.replace('.ts', '');
        return `export * from './${moduleName}';`;
      })
      .join(os.EOL);

    if (exports.length === 0) {
      throw new Error(
        'No exports found in migrations directory. Something might have gone wrong.',
      );
    }

    await fs.writeFile(indexFile, exports);
    console.log(`${indexFile} updated successfully. \nExports:\n${exports}`);
  } catch (err) {
    console.error(`Error processing ${migrationsDir}:`, err);
  }
}

async function createUppercaseFunction(libsDir) {
  const utilsDir = path.join(libsDir, 'lib/utils');
  const uppercaseFilePath = path.join(utilsDir, 'uppercase.ts');
  const indexFilePath = path.join(libsDir, 'index.ts');

  try {
    try {
      await fs.access(utilsDir);
    } catch (error) {
      await fs.mkdir(utilsDir);
    }

    const uppercaseFunction = `export function uppercase(input: string): string {
      return input.toUpperCase();
    }`;

    await fs.writeFile(uppercaseFilePath, uppercaseFunction);

    const exportLine = `${os.EOL}export * from './lib/utils/uppercase';`;

    await fs.appendFile(indexFilePath, exportLine);
  } catch (error) {
    console.error('Error in createUppercaseFunction:', error);
  }
}

async function addEndpointToController(controllersDir) {
  if (!controllersDir) return;
  const controllerFile = path.join(
    controllersDir,
    '/invoices/invoice.controller.ts',
  );
  const endpointSignature = "@Post('/uppercase')";

  const importStatement =
    "import { Permissions, SkipAuth } from '@softkit/auth';\nimport { uppercase } from '@test/source'\n";

  let endpointLogic = `
  @Post('/uppercase')
  @SkipAuth()
  uppercaseBody(@Body() body: { text: string }): { uppercaseText: string } {
    return { uppercaseText: uppercase(body.text) };
  }
`;

  if (controllersDir.includes('dashboard')) {
    endpointLogic = `
    @Get('/uppercase')
    @SkipAuth()
    async uppercaseBody() {
      const response = await fetch(
        'http://localhost:3000/api/platform/v1/invoice/uppercase',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: 'test string' }),
        },
      );

      return response.json();
    }
`;
  }

  try {
    const data = await fs.readFile(controllerFile, 'utf8');

    if (data.includes(endpointSignature)) {
      console.log('Endpoint already exists in the controller file.');
      return;
    }

    let updatedData = data.replace(
      "import { Permissions } from '@softkit/auth'",
      importStatement.trim(),
    );

    updatedData = updatedData.replace(/(\n}\n)$/, `${os.EOL}${endpointLogic}}`);

    await fs.writeFile(controllerFile, updatedData, 'utf8');
    console.log(`${controllerFile} updated successfully.`);
  } catch (error) {
    console.error(`Error processing ${controllerFile}:`, error);
  }
}
async function updateEnvYaml(assetsDir) {
  const contents = assetsDir.match(/\/apps\/([^/]+)\//);

  const app = contents[1];
  if (!app) {
    console.error('Update .env.yaml failed. Incorrect path provided.');
    return;
  }

  const yamlFilePath = path.join(assetsDir, '.env.yaml');

  try {
    await fs.access(yamlFilePath);
  } catch (error) {
    console.error(`${yamlFilePath} file not found`);
    return;
  }

  try {
    const fileContents = await fs.readFile(yamlFilePath, 'utf8');
    const data = yaml.load(fileContents);
    console.log(data, 'data object');

    data.i18 = {
      paths: [
        'i18n/',
        '../../../node_modules/@softkit/validation/i18n/',
        '../../../node_modules/@softkit/exceptions/i18n/',
      ],
    };

    data.db = {
      ...data.db,
      applicationName: app,
      port: '${DB_PORT:-2221}',
      database: '${DB_NAME:-postgres}',
    };

    const newYamlContent = yaml.dump(data);
    await fs.writeFile(yamlFilePath, newYamlContent, 'utf8');
    console.log(`${yamlFilePath} updated successfully.`);
  } catch (error) {
    console.error(`Error updating ${yamlFilePath}:`, error);
  }
}

async function addSkipAuthDecoratorForControllerEndpoint(controllersDir) {
  if (controllersDir?.includes('dashboard')) return;
  const controllerFile = path.join(
    controllersDir,
    'invoices-new/invoice-new.controller.ts',
  );
  if (!controllerFile) return;
  try {
    const data = await fs.readFile(controllerFile, 'utf8');

    const updatedData = data
      .replace("@Permissions('platform.invoice-new.read')", '@SkipAuth()')
      .replace(
        "import { Permissions } from '@softkit/auth'",
        "import { Permissions, SkipAuth } from '@softkit/auth';",
      );

    await fs.writeFile(controllerFile, updatedData, 'utf8');
    console.log(`${controllerFile} updated successfully.`);
  } catch (error) {
    console.error(`Error updating ${controllerFile} file:`, error);
  }
}

async function executeUpdates(
  migrationsDir,
  libsDir,
  assetsDir,
  controllersDir,
) {
  try {
    if (argv.migrationsDir) {
      await updateIndexFile(migrationsDir);
    }

    if (argv.libsDir) {
      await createUppercaseFunction(libsDir);
    }

    if (argv.assetsDir) {
      await updateEnvYaml(assetsDir);
    }
    if (argv.controllersDir) {
      await addEndpointToController(controllersDir);
      await addSkipAuthDecoratorForControllerEndpoint(controllersDir);
    }
  } catch (error) {
    console.error('Error during updates:', error);
  }
}
executeUpdates(
  argv.migrationsDir,
  argv.libsDir,
  argv.assetsDir,
  argv.controllersDir,
);
