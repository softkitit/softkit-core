import type { ParsedCommandLine } from 'typescript';
import {
  getRootTsConfigFileName,
  readTsConfig,
  registerTsConfigPaths,
} from './ts-config';
import { registerTranspiler } from './compiler/register';

export let unregisterPluginTSTranspiler: (() => void) | undefined;

/**
 * Register swc-node or ts-node if they are not currently registered
 * with some default settings which work well for Sk plugins.
 */
export function registerPluginTSTranspiler() {
  // Get the first tsconfig that matches the allowed set
  const tsConfigName = getRootTsConfigFileName();

  if (!tsConfigName) {
    return;
  }

  const tsConfig: Partial<ParsedCommandLine> = tsConfigName
    ? readTsConfig(tsConfigName)
    : {};
  const cleanupFns = [
    registerTsConfigPaths(tsConfigName),
    registerTranspiler({
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      ...tsConfig.options,
    }),
  ];
  unregisterPluginTSTranspiler = () => {
    for (const fn of cleanupFns) fn?.();
  };
}
