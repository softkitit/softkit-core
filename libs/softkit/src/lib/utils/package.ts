import { dirname, sep } from 'node:path';
import { join } from 'node:path';
import { readJsonFile } from './file/fileutils';
import { appRootPath } from './file/app-root-path';
import { PACKAGE_JSON_FILE_NAME } from '../vo/constants';
import { PackageJson } from '../vo/package-json';
import { existsSync } from 'node:fs';

const packageInstallationDirectories = [
  `${sep}node_modules${sep}`,
  `${sep}.yarn${sep}`,
];

export function clearRequireCache(): void {
  for (const k of Object.keys(require.cache)) {
    if (!packageInstallationDirectories.some((dir) => k.includes(dir))) {
      delete require.cache[k];
    }
  }
}

function packageIsInstalled(m: string) {
  try {
    require.resolve(m);
    return true;
  } catch {
    return false;
  }
}

export function getDependenciesFromPackageJson(
  packageJsonPath = PACKAGE_JSON_FILE_NAME,
): string[] {
  try {
    const rootPath = appRootPath();
    const { dependencies, devDependencies } =
      readJsonFile<PackageJson>(join(rootPath, packageJsonPath)) || {};
    return Object.keys({ ...dependencies, ...devDependencies });
  } catch {
    /* empty */
  }
  return [];
}

/**
 * Reads the package.json file for a specified module.
 *
 * Includes a fallback that accounts for modules that don't export package.json
 *
 * @param {string} moduleSpecifier The module to look up
 *
 * @returns package json contents and path
 */
export function readModulePackageJson(moduleSpecifier: string): {
  packageJson: PackageJson;
  path: string;
} {
  const result = readModuleJson<PackageJson>(
    moduleSpecifier,
    PACKAGE_JSON_FILE_NAME,
  );

  if (result.json.name && result.json.name !== moduleSpecifier) {
    throw new Error(
      `Found module ${result.json.name} while trying to locate ${moduleSpecifier}/package.json`,
    );
  }

  return {
    packageJson: result.json,
    path: result.path,
  };
}

export function readModuleJson<T extends object>(
  moduleSpecifier: string,
  filePath: string,
): {
  json: T;
  path: string;
} {
  let jsonPath: string;
  const entryPoint = require.resolve(moduleSpecifier, {
    paths: [appRootPath()],
  });

  let moduleRootPath = dirname(entryPoint);
  jsonPath = join(moduleRootPath, filePath);

  while (!existsSync(jsonPath)) {
    moduleRootPath = dirname(moduleRootPath);
    jsonPath = join(moduleRootPath, filePath);
  }

  const resultFile = readJsonFile<T>(jsonPath);

  return {
    json: resultFile!,
    path: jsonPath,
  };
}

export function readRootPackageJson(): PackageJson {
  const rootPath = appRootPath();
  const rootPackageJson = readJsonFile<PackageJson>(
    join(rootPath, PACKAGE_JSON_FILE_NAME),
  );

  if (!rootPackageJson) {
    throw new Error(
      `There is no root package.json file in ${appRootPath}. Please make sure you are running the command in a Node.js project.`,
    );
  }

  return rootPackageJson;
}
