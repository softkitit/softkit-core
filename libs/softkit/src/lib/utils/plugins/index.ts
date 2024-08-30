import {
  getDependenciesFromPackageJson,
  readModulePackageJson,
} from '../package';
import { PackageJson } from '../../vo/package-json';
import { PluginInfo } from './vo/plugin-info';
import { dirname, extname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { registerPluginTSTranspiler } from '../compiler';
import { logger } from '../logger';

export function findPlugins(): PluginInfo[] {
  const packageJsonDeps = getDependenciesFromPackageJson();

  return packageJsonDeps
    .map((dep) => {
      const { packageJson, modulePath } = getSkPluginPackageJson(dep) || {};

      return {
        packageJson,
        path: modulePath,
        local: false,
      };
    })
    .filter((pluginInfo): pluginInfo is PluginInfo => !!pluginInfo.packageJson);
}

export function hasBuiltInPlugin(pkgJson: PackageJson): boolean {
  return ['generators'].some((field) => field in (pkgJson?.sk || {}));
}

function getSkPluginPackageJson(
  pkg: string,
): { packageJson: PackageJson; modulePath: string } | undefined {
  try {
    const { packageJson, path } = readModulePackageJson(pkg);
    return packageJson && hasBuiltInPlugin(packageJson)
      ? { packageJson, modulePath: dirname(path) }
      : undefined;
  } catch (error) {
    logger.error(`Error reading package.json for ${pkg}, ${error}`);
    return undefined;
  }
}

/**
 * This function is used to resolve the implementation of an executor or generator.
 * @param implementationModulePath
 * @param directory
 * @returns path to the implementation
 */
export function resolveImplementation(
  implementationModulePath: string,
  directory: string,
): string {
  const validImplementations = ['', '.js', '.ts'].map(
    (x) => implementationModulePath + x,
  );

  for (const maybeImplementation of validImplementations) {
    const maybeImplementationPath = join(directory, maybeImplementation);
    if (existsSync(maybeImplementationPath)) {
      return maybeImplementationPath;
    }

    try {
      return require.resolve(maybeImplementation, {
        paths: [directory],
      });
    } catch {
      /* empty */
    }
  }

  throw new Error(
    `Could not resolve "${implementationModulePath}" from "${directory}".`,
  );
}

/**
 * This function is used to get the implementation factory of an executor or generator.
 * @param implementation path to the implementation
 * @param directory path to the directory
 * @returns a function that returns the implementation
 */
export function getImplementationFactory<T>(
  implementation: string,
  directory: string,
): () => T {
  const [implementationModulePath, implementationExportName] =
    implementation.split('#');
  return () => {
    const modulePath = resolveImplementation(
      implementationModulePath,
      directory,
    );
    if (extname(modulePath) === '.ts') {
      registerPluginTSTranspiler();
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(modulePath);
    return implementationExportName
      ? module[implementationExportName]
      : module.default ?? module;
  };
}
