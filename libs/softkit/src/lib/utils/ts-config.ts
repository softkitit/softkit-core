import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { appRootPath } from './file/app-root-path';
import { dirname } from 'node:path';
import type { ParsedCommandLine } from 'typescript';
import { logger } from './logger';

let tsModule: typeof import('typescript');

export function getRootTsConfigFileName(): string | null {
  for (const tsConfigName of ['tsconfig.base.json', 'tsconfig.json']) {
    const pathExists = existsSync(join(appRootPath(), tsConfigName));
    if (pathExists) {
      return tsConfigName;
    }
  }

  return null;
}

export function readTsConfig(tsConfigPath: string): ParsedCommandLine {
  if (!tsModule) {
    tsModule = require('typescript');
  }
  const readResult = tsModule.readConfigFile(
    tsConfigPath,
    tsModule.sys.readFile,
  );
  return tsModule.parseJsonConfigFileContent(
    readResult.config,
    tsModule.sys,
    dirname(tsConfigPath),
  );
}

function loadTsConfigPaths(): typeof import('tsconfig-paths') | undefined {
  try {
    return require('tsconfig-paths');
  } catch {
    logger.warn(
      `Unable to load tsconfig-paths, workspace libraries may be inaccessible.
  - To fix this, install tsconfig-paths`,
    );
    return;
  }
}

/**
 * @param tsConfigPath Adds the paths from a tsconfig file into node resolutions
 * @returns cleanup function
 */
export function registerTsConfigPaths(tsConfigPath: string): () => void {
  try {
    /**
     * Load the ts config from the source project
     */
    const tsconfigPaths = loadTsConfigPaths();
    const tsConfigResult = tsconfigPaths?.loadConfig(tsConfigPath);
    /**
     * Register the custom workspace path mappings with node so that workspace libraries
     * can be imported and used within project
     */
    if (tsConfigResult?.resultType === 'success') {
      tsconfigPaths?.register({
        baseUrl: tsConfigResult.absoluteBaseUrl,
        paths: tsConfigResult.paths,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new TypeError(`Unable to load ${tsConfigPath}: ` + error.message);
    }
  }
  throw new Error(`Unable to load ${tsConfigPath}`);
}
