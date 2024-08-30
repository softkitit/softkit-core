import { PackageManagerType } from '../../vo/package-manager';
import { Tree } from '../../service/tree';
import { MonorepoManagerType } from '../../vo/monorepo-manager-type';
import { readJsonFile } from '../file/fileutils';
import { appRootPath } from '../file/app-root-path';
import { PackageJson } from '../../vo/package-json';
import globby from 'globby';
import { logger } from '../logger';
import { AppContext } from '../app-context/vo/app-context';
import { detectAppTypeAndFramework } from '../app-context';
import { readRootPackageJson } from '../package';
import { hasBuiltInPlugin } from '../plugins';

export function detectMonorepoManager(
  tree: Tree,
  packageManager: PackageManagerType,
): MonorepoManagerType | undefined {
  if (tree.exists('nx.json')) {
    return 'nx';
  } else {
    const packageJson = readRootPackageJson();

    return packageJson?.workspaces ? packageManager : undefined;
  }
}

export async function getListOfApps(
  monorepoManager?: MonorepoManagerType,
): Promise<AppContext[]> {
  if (!monorepoManager) {
    const packageJson = readRootPackageJson();
    const app = detectAppTypeAndFramework(packageJson);

    return [
      {
        ...app,
        packageJson,
        path: appRootPath(),
        hasBuiltInPlugin: hasBuiltInPlugin(packageJson),
        name: packageJson.name,
        // todo implement getting used plugins info
        usedPlugins: [],
      },
    ];
  }

  const packages = getPackagesPaths(monorepoManager);

  if (packages.length === 0) {
    logger.warn('No packages found in the monorepo');
    return [];
  }

  const apps = await findAllMonorepoApps(packages);

  return apps.map((app) => {
    const appType = detectAppTypeAndFramework(app.packageJson);

    return {
      ...app,
      ...appType,
      hasBuiltInPlugin: hasBuiltInPlugin(app.packageJson),
      // todo implement getting used plugins info
      usedPlugins: [],
    };
  });
}

function getPackagesPaths(monorepoManager: MonorepoManagerType) {
  switch (monorepoManager) {
    case 'nx': {
      return ['apps/*', 'libs/*'];
    }
    case 'bun':
    case 'yarn':
    case 'npm':
    case 'pnpm': {
      const workspaces = readRootPackageJson().workspaces;

      const packages = Array.isArray(workspaces)
        ? workspaces
        : workspaces?.packages;

      return packages ?? [];
    }
    default: {
      throw new Error(`Monorepo manager ${monorepoManager} is not supported`);
    }
  }
}

const findAllMonorepoApps = async (packageSpecs: string[]) => {
  return globby(packageSpecs).then((paths) => {
    return paths
      .map((path) => {
        const packageJson = readJsonFile<PackageJson>(path);
        if (packageJson) {
          return {
            packageJson,
            name: packageJson.name,
            path,
          };
        } else {
          logger.verbose(
            `Could not read package.json at ${path}, for monorepo project, looks like a package is not an app`,
          );
          // eslint-disable-next-line sonarjs/no-redundant-jump
          return;
        }
      })
      .filter(
        (
          x,
        ): x is {
          packageJson: PackageJson;
          name: string;
          path: string;
        } => x !== undefined,
      );
  });
};
