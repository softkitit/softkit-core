import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { remove } from 'fs-extra';
import { dirname, join, relative } from 'node:path';
import { gte, lt } from 'semver';
import { dirSync } from 'tmp';
import {
  readFileIfExisting,
  readJsonFile,
  writeJsonFile,
} from './file/fileutils';
import { appRootPath } from './file/app-root-path';
import { PackageManagerType } from '../vo/package-manager';
import { Tree } from '../service/tree';
import { PackageJson } from '../vo/package-json';
import { PACKAGE_JSON_FILE_NAME } from '../vo/constants';
import { readRootPackageJson } from './package';

export type PackageManager = 'yarn' | 'pnpm' | 'npm' | 'bun';

export interface PackageManagerCommands {
  preInstall?: string;
  install: string;
  ciInstall: string;
  updateLockFile: string;
  add: string;
  addDev: string;
  rm: string;
  exec: string;
  dlx: string;
  list: string;
  listWorkspaces?: string;
  run: (script: string, args?: string) => string;
  // Make this required once bun adds programmatically support for reading config https://github.com/oven-sh/bun/issues/7140
  getRegistryUrl?: string;
}

/**
 * Detects which package manager is used in the app based on the lock file.
 */
export function detectPackageManager(tree: Tree): PackageManagerType {
  const rootPackageJson = readRootPackageJson();

  if (rootPackageJson?.packageManager) {
    return rootPackageJson.packageManager as PackageManagerType;
  } else if (tree.exists('bun.lockb')) {
    return 'bun';
  } else if (tree.exists('yarn.lock')) {
    return 'yarn';
  } else if (tree.exists('pnpm-lock.yaml')) {
    return 'pnpm';
  } else {
    return 'npm';
  }
}

/**
 * Returns commands for the package manager used in the workspace.
 * By default, the package manager is derived based on the lock file,
 * but it can also be passed in explicitly.
 *
 * Example:
 *
 * ```javascript
 * execSync(`${getPackageManagerCommand().addDev} my-dev-package`);
 * ```
 *
 * @param packageManager The package manager to use. If not provided, it will be detected based on the lock file.
 * @param root The directory the commands will be ran inside of. Defaults to the current workspace's root.
 */
export function getPackageManagerCommands(
  packageManager: PackageManager,
  root: string = appRootPath(),
): PackageManagerCommands {
  const commands: { [pm in PackageManager]: () => PackageManagerCommands } = {
    yarn: () => {
      let yarnVersion: string, useBerry: boolean;
      try {
        yarnVersion = getPackageManagerVersion('yarn', root);
        useBerry = gte(yarnVersion, '2.0.0');
      } catch {
        yarnVersion = 'latest';
        useBerry = true;
      }

      return {
        preInstall: `yarn set version ${yarnVersion}`,
        install: 'yarn',
        ciInstall: useBerry
          ? 'yarn install --immutable'
          : 'yarn install --frozen-lockfile',
        updateLockFile: useBerry
          ? 'yarn install --mode update-lockfile'
          : 'yarn install',
        add: useBerry ? 'yarn add' : 'yarn add -W',
        addDev: useBerry ? 'yarn add -D' : 'yarn add -D -W',
        rm: 'yarn remove',
        exec: 'yarn',
        dlx: useBerry ? 'yarn dlx' : 'yarn',
        run: (script: string, args?: string) =>
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          `yarn ${script}${args ? ` ${args}` : ''}`,
        list: useBerry ? 'yarn info --name-only' : 'yarn list',
        getRegistryUrl: useBerry
          ? 'yarn config get npmRegistryServer'
          : 'yarn config get registry',
      };
    },
    pnpm: () => {
      let modernPnpm: boolean, includeDoubleDashBeforeArgs: boolean;
      try {
        const pnpmVersion = getPackageManagerVersion('pnpm', root);
        modernPnpm = gte(pnpmVersion, '6.13.0');
        includeDoubleDashBeforeArgs = lt(pnpmVersion, '7.0.0');
      } catch {
        modernPnpm = true;
        includeDoubleDashBeforeArgs = true;
      }

      const isPnpmWorkspace = existsSync(join(root, 'pnpm-workspace.yaml'));

      return {
        install: 'pnpm install --no-frozen-lockfile', // explicitly disable in case of CI
        ciInstall: 'pnpm install --frozen-lockfile',
        updateLockFile: 'pnpm install --lockfile-only',
        add: isPnpmWorkspace ? 'pnpm add -w' : 'pnpm add',
        addDev: isPnpmWorkspace ? 'pnpm add -Dw' : 'pnpm add -D',
        rm: 'pnpm rm',
        exec: modernPnpm ? 'pnpm exec' : 'pnpx',
        dlx: modernPnpm ? 'pnpm dlx' : 'pnpx',
        run: (script: string, args?: string) =>
          `pnpm run ${script}${
            args
              ? // eslint-disable-next-line unicorn/no-nested-ternary
                includeDoubleDashBeforeArgs
                ? ' -- ' + args
                : ` ${args}`
              : ''
          }`,
        list: 'pnpm ls --depth 100',
        listWorkspaces: `pnpm -C ${root} m ls --json --depth=-1`,
        getRegistryUrl: 'pnpm config get registry',
      };
    },
    npm: () => {
      return {
        install: 'npm install',
        ciInstall: 'npm ci',
        updateLockFile: 'npm install --package-lock-only',
        add: 'npm install',
        addDev: 'npm install -D',
        rm: 'npm rm',
        exec: 'npx',
        // download and execute a package
        dlx: 'npx',
        run: (script: string, args?: string) =>
          `npm run ${script}${args ? ' -- ' + args : ''}`,
        list: 'npm ls',
        getRegistryUrl: 'npm config get registry',
      };
    },
    bun: () => {
      // bun doesn't current support programmatically reading config https://github.com/oven-sh/bun/issues/7140
      return {
        install: 'bun install',
        ciInstall: 'bun install --no-cache',
        updateLockFile: 'bun install --frozen-lockfile',
        add: 'bun install',
        addDev: 'bun install -D',
        rm: 'bun rm',
        exec: 'bun',
        dlx: 'bunx',
        run: (script: string, args?: string) =>
          `bun run ${script} ${args ? ' -- ' + args : ''}`,
        list: 'bun pm ls',
      };
    },
  };

  return commands[packageManager]();
}

/**
 * Returns the version of the package manager used in the workspace.
 * By default, the package manager is derived based on the lock file,
 * but it can also be passed in explicitly.
 */
export function getPackageManagerVersion(
  packageManager: PackageManager,
  cwd = process.cwd(),
): string {
  let version;
  try {
    version = execSync(`${packageManager} --version`, {
      cwd,
      encoding: 'utf8',
    }).trim();
  } catch {
    const packageJsonFileName = PACKAGE_JSON_FILE_NAME;

    if (existsSync(join(cwd, packageJsonFileName))) {
      const packageVersion = readJsonFile<PackageJson>(
        join(cwd, packageJsonFileName),
      )?.packageManager;
      if (packageVersion) {
        const [packageManagerFromPackageJson, versionFromPackageJson] =
          packageVersion.split('@');
        if (
          packageManagerFromPackageJson === packageManager &&
          versionFromPackageJson
        ) {
          version = versionFromPackageJson;
        }
      }
    }
  }
  if (!version) {
    throw new Error(`Cannot determine the version of ${packageManager}.`);
  }
  return version;
}

/**
 * Checks for a project level npmrc file by crawling up the file tree until
 * hitting a package.json file, as this is how npm finds them as well.
 */
export function findFileInPackageJsonDirectory(
  file: string,
  directory: string = process.cwd(),
): string | undefined {
  while (!existsSync(join(directory, PACKAGE_JSON_FILE_NAME))) {
    directory = dirname(directory);
  }
  const path = join(directory, file);
  return existsSync(path) ? path : undefined;
}

/**
 * We copy yarnrc.yml to the temporary directory to ensure things like the specified
 * package registry are still used. However, there are a few relative paths that can
 * cause issues, so we modify them to fit the new directory.
 *
 * Exported for testing - not meant to be used outside of this file.
 *
 * @param contents The string contents of the yarnrc.yml file
 * @returns Updated string contents of the yarnrc.yml file
 */
export function modifyYarnRcYmlToFitNewDirectory(contents: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parseSyml, stringifySyml } = require('@yarnpkg/parsers');
  const parsed: {
    yarnPath?: string;
    plugins?: (string | { path: string; spec: string })[];
  } = parseSyml(contents);

  if (parsed.yarnPath) {
    // yarnPath is relative to the workspace root, so we need to make it relative
    // to the new directory s.t. it still points to the same yarn binary.
    delete parsed.yarnPath;
  }
  if (parsed.plugins) {
    // Plugins specified by a string are relative paths from workspace root.
    // ex: https://yarnpkg.com/advanced/plugin-tutorial#writing-our-first-plugin
    delete parsed.plugins;
  }
  return stringifySyml(parsed);
}

/**
 * We copy .yarnrc to the temporary directory to ensure things like the specified
 * package registry are still used. However, there are a few relative paths that can
 * cause issues, so we modify them to fit the new directory.
 *
 * Exported for testing - not meant to be used outside of this file.
 *
 * @param contents The string contents of the yarnrc.yml file
 * @returns Updated string contents of the yarnrc.yml file
 */
export function modifyYarnRcToFitNewDirectory(contents: string): string {
  const lines = contents.split('\n');
  const yarnPathIndex = lines.findIndex((line) => line.startsWith('yarn-path'));
  if (yarnPathIndex !== -1) {
    lines.splice(yarnPathIndex, 1);
  }
  return lines.join('\n');
}

export function copyPackageManagerConfigurationFiles(
  root: string,
  destination: string,
) {
  for (const packageManagerConfigFile of [
    '.npmrc',
    '.yarnrc',
    '.yarnrc.yml',
    'bunfig.toml',
  ]) {
    // f is an absolute path, including the {appRoot}.
    const f = findFileInPackageJsonDirectory(packageManagerConfigFile, root);
    if (f) {
      // Destination should be the same relative path from the {appRoot},
      // but now relative to the destination. `relative` makes `{appRoot}/some/path`
      // look like `./some/path`, and joining that gets us `{destination}/some/path
      const destinationPath = join(destination, relative(root, f));
      switch (packageManagerConfigFile) {
        case '.npmrc': {
          copyFileSync(f, destinationPath);
          break;
        }
        case '.yarnrc': {
          const updated = modifyYarnRcToFitNewDirectory(readFileIfExisting(f));
          writeFileSync(destinationPath, updated);
          break;
        }
        case '.yarnrc.yml': {
          const updated = modifyYarnRcYmlToFitNewDirectory(
            readFileIfExisting(f),
          );
          writeFileSync(destinationPath, updated);
          break;
        }
        case 'bunfig.toml': {
          copyFileSync(f, destinationPath);
          break;
        }
      }
    }
  }
}

/**
 * Creates a temporary directory where you can run package manager commands safely.
 *
 * For cases where you'd want to install packages that require an `.npmrc` set up,
 * this function looks up for the nearest `.npmrc` (if exists) and copies it over to the
 * temp directory.
 */
export function createTempNpmDirectory() {
  const dir = dirSync().name;

  // A package.json is needed for pnpm pack and for .npmrc to resolve
  writeJsonFile(`${dir}/package.json`, {});
  copyPackageManagerConfigurationFiles(appRootPath(), dir);

  const cleanup = async () => {
    try {
      await remove(dir);
    } catch {
      // It's okay if this fails, the OS will clean it up eventually
    }
  };

  return { dir, cleanup };
}
