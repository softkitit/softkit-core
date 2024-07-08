const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const functionMappings = {
  updateMigrationsIndexFile,
  addUppercaseEndpointToController,
  addUppercaseFunctionToLib,
  updateDatabaseConfig,
};

const argv = yargs(hideBin(process.argv))
  .option('updateMigrationsIndexFile', {
    alias: 'm',
    describe: 'Path to the migrations directory',
    type: 'string',
  })
  .option('addUppercaseEndpointToController', {
    alias: 'c',
    describe: 'Path to the controllers directory',
    type: 'string',
  })
  .option('addUppercaseFunctionToLib', {
    alias: 'l',
    describe: 'Path to the libraries directory',
    type: 'string',
  })
  .option('updateDatabaseConfig', {
    alias: 'a',
    describe: 'Path to the assets directory',
    type: 'string',
  }).argv;

async function updateMigrationsIndexFile(migrationsDir) {
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

    const indexFile = path.join(migrationsDir, 'index.ts');

    await fs.writeFile(indexFile, exports, 'utf8');
    console.log(`${indexFile} updated successfully. \nExports:\n${exports}`);
  } catch (error) {
    console.error(`Error processing ${migrationsDir}:`, error);
    throw error;
  }
}

/**
 * Adds an 'uppercase' utility function to a specified library directory.
 * This is part of the testing flow for our resource-plugin library generator
 */
async function addUppercaseFunctionToLib(libsDir) {
  const utilsDir = path.join(libsDir, 'lib/utils');
  const uppercaseFilePath = path.join(utilsDir, 'uppercase.ts');
  const indexFilePath = path.join(libsDir, 'index.ts');

  try {
    try {
      await fs.access(utilsDir);
    } catch (error) {
      await fs.mkdir(utilsDir);
    }

    const uppercaseFunctionContent = `export function uppercase(input: string): string {
      return input.toUpperCase();
    }`;

    await fs.writeFile(uppercaseFilePath, uppercaseFunctionContent, 'utf8');

    const exportLine = `${os.EOL}export * from './lib/utils/uppercase';`;

    await fs.appendFile(indexFilePath, exportLine, 'utf8');
  } catch (error) {
    console.error(`Error in addUppercaseFunctionToLib:`, error);
    throw error;
  }
}

function getEndpointFunctionContent(controllersDir) {
  if (controllersDir.includes('dashboard')) {
    return `
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
  } else {
    return `
  @Post('/uppercase')
  @SkipAuth()
  uppercaseBody(@Body() body: { text: string }): { uppercaseText: string } {
    return { uppercaseText: uppercase(body.text) };
  }
`;
  }
}

function updateControllerFile(data, controllersDir) {
  const importStatement =
    "import { Permissions, SkipAuth } from '@softkit/auth';\nimport { uppercase } from '@test/source'\n";

  let updatedData = data.replace(
    "import { Permissions } from '@softkit/auth'",
    importStatement.trim(),
  );

  updatedData = updatedData.replace(
    /(\n}\n)$/,
    `${os.EOL}${getEndpointFunctionContent(controllersDir)}}`,
  );

  return updatedData;
}

async function addUppercaseEndpointToController(controllersDir) {
  const controllerFile = path.join(
    controllersDir,
    '/invoices/invoice.controller.ts',
  );

  try {
    const endpointSignature = "@Post('/uppercase')";
    const data = await fs.readFile(controllerFile, 'utf8');

    if (data.includes(endpointSignature)) {
      throw new Error('Endpoint already exists in the controller file.');
    }

    const updatedData = updateControllerFile(data, controllersDir);

    await fs.writeFile(controllerFile, updatedData, 'utf8');
    console.log(`${controllerFile} updated successfully.`);
  } catch (error) {
    console.error(`Error processing ${controllerFile}:`, error);
    throw error;
  }
}

/**
 * Prepares the test environment's database settings within Docker.
 * It updates the .env.yaml to match the Dockerized PostgreSQL test instance.
 */
async function updateDatabaseConfig(assetsDir) {
  const contents = assetsDir.match(/\/apps\/([^/]+)\//);

  const applicationName = contents[1];
  if (!applicationName) {
    console.error('Update .env.yaml failed. Incorrect path provided.');
    return;
  }

  const yamlFilePath = path.join(assetsDir, '.env.yaml');

  try {
    await fs.access(yamlFilePath);
  } catch (error) {
    console.error(`${yamlFilePath} file not found`);
    throw error;
  }

  try {
    const fileContents = await fs.readFile(yamlFilePath, 'utf8');
    const data = yaml.load(fileContents);

    data.db = {
      ...data.db,
      applicationName,
      port: '${DB_PORT:-2221}',
      database: '${DB_NAME:-postgres}',
    };

    const newYamlContent = yaml.dump(data);
    await fs.writeFile(yamlFilePath, newYamlContent, 'utf8');

    console.log(`${yamlFilePath} updated successfully.`);
  } catch (error) {
    console.error(`Error updating ${yamlFilePath}:`, error);
    throw error;
  }
}

async function executeUpdates(argv) {
  try {
    const yargsOptions = yargs.getOptions();
    const optionAliases = new Set(Object.values(yargsOptions.alias).flat());

    // Exclude the first two elements (help and version) and aliases from the option entries
    const optionEntries = Object.entries(yargsOptions.key)
      .slice(2)
      .filter(([optionName]) => !optionAliases.has(optionName));

    for (const [optionName, isOptionEnabled] of optionEntries) {
      if (!isOptionEnabled) continue;

      const action = functionMappings[optionName];
      const actionArguments = argv[optionName];

      if (action && actionArguments) {
        await action(actionArguments);
      }
    }
  } catch (error) {
    console.error('Error during updates:', error);
    throw error;
  }
}

executeUpdates(argv);
