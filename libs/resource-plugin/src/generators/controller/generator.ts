import {
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateJson,
  writeJson,
} from '@nx/devkit';
import { ControllerGeneratorSchema } from './schema';
import {
  camelCase,
  capitalCase,
  constantCase,
  paramCase,
  pascalCase,
  snakeCase,
} from 'change-case';
import { EOL } from 'node:os';
import { runLint } from '../common/run-lint';

const permissionsFilePath = 'src/app/assets/migrations/permissions.json';
const defaultRoles = ['SUPER_ADMIN', 'ADMIN'];
const permissions = ['create', 'read', 'update', 'delete'];

function generatePermissions(
  appRoot: string,
  tree: Tree,
  options: ControllerGeneratorSchema,
) {
  const permissionsFile = joinPathFragments(appRoot, permissionsFilePath);

  const newPermissionsCategory = {
    categoryName: pascalCase(options.groupName),
    categoryDescription: `${pascalCase(options.groupName)} management`,
    permissions: permissions.map((permission) => ({
      name: `${pascalCase(permission)} ${pascalCase(options.controllerName)}`,
      description: `${pascalCase(permission)} ${pascalCase(
        options.controllerName,
      )}`,
      action: `${options.projectName}.${options.controllerName}.${permission}`,
      roles: defaultRoles,
    })),
  };

  if (tree.exists(permissionsFile)) {
    updateJson(tree, permissionsFile, (permissionsJson) => {
      const existingCategory = permissionsJson.find(
        (p) =>
          p.categoryName.toLowerCase().trim() ===
          newPermissionsCategory.categoryName.toLowerCase().trim(),
      );

      if (existingCategory) {
        existingCategory.permissions.push(
          ...newPermissionsCategory.permissions,
        );
      } else {
        permissionsJson.push(newPermissionsCategory);
      }
      return permissionsJson;
    });
  } else {
    writeJson(tree, permissionsFile, [newPermissionsCategory]);
  }
}

export async function controllerGenerator(
  tree: Tree,
  options: ControllerGeneratorSchema,
) {
  const appRoot = readProjectConfiguration(tree, options.projectName).root;

  const srcFolder = joinPathFragments(__dirname, './files');
  generateFiles(tree, srcFolder, appRoot, {
    ...options,
    snakeCase,
    pascalCase,
    paramCase,
    camelCase,
    capitalCase,
    constantCase,
  });

  const controllersFolder = joinPathFragments(appRoot, 'src/app/controllers');

  const controllerFileName = `${options.controllerName}.controller`;
  const exportPathForIndex = joinPathFragments(
    options.groupName,
    controllerFileName,
  );

  const indexFilePath = joinPathFragments(controllersFolder, `index.ts`);

  const contents = tree.exists(indexFilePath)
    ? tree.read(indexFilePath).toString()
    : '';
  const newContents = `${contents}${EOL}export * from './${exportPathForIndex}';`;
  tree.write(indexFilePath, newContents);

  generatePermissions(appRoot, tree, options);

  /* istanbul ignore next */ if (options.lintCommandName) {
    return () => runLint(options.projectName, options.lintCommandName);
  }
}

export default controllerGenerator;
