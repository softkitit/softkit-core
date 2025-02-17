import { readdirSync, readFileSync, statSync } from 'node:fs';
import { isBinaryPath } from '../binary-extensions';

import * as path from 'node:path';
import { Tree } from '../../service/tree';

/**
 * Specify what should be done when a file is generated but already exists on the system
 */
export enum OverwriteStrategy {
  OVERWRITE = 'OVERWRITE',
  KEEP_EXISTING = 'KEEP_EXISTING',
  THROW_ERROR_IF_EXISTS = 'THROW_ERROR_IF_EXISTS',
}

/**
 * Options for the generateFiles function
 */
export interface GenerateFilesOptions {
  /**
   * Specify what should be done when a file is generated but already exists on the system
   */
  overwriteStrategy?: OverwriteStrategy;
}

/**
 * Generates a folder of files based on provided templates.
 *
 * While doing so it performs two substitutions:
 * - Substitutes segments of file names surrounded by __
 * - Uses ejs to substitute values in templates
 *
 * Examples:
 * ```typescript
 * generateFiles(tree, path.join(__dirname , 'files'), './tools/scripts', {tmpl: '', name: 'myscript'})
 * ```
 * This command will take all the files from the `files` directory next to the place where the command is invoked from.
 * It will replace all `__tmpl__` with '' and all `__name__` with 'myscript' in the file names, and will replace all
 * `<%= name %>` with `myscript` in the files themselves.
 * `tmpl: ''` is a common pattern. With it you can name files like this: `index.ts__tmpl__`, so your editor
 * doesn't get confused about incorrect TypeScript files.
 *
 * @param tree - the file system tree
 * @param srcFolder - the source folder of files (absolute path)
 * @param target - the target folder (relative to the tree root)
 * @param substitutions - an object of key-value pairs
 * @param options - See {@link GenerateFilesOptions}
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function generateFiles(
  tree: Tree,
  srcFolder: string,
  target: string,
  substitutions: { [k: string]: unknown },
  options?: GenerateFilesOptions,
): void {
  options ??= {};
  options.overwriteStrategy ??= OverwriteStrategy.OVERWRITE;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ejs: typeof import('ejs') = require('ejs');

  const files = allFilesInDir(srcFolder);
  if (files.length === 0) {
    throw new Error(
      `generateFiles: No files found in "${srcFolder}". Are you sure you specified the correct path?`,
    );
  } else {
    for (const filePath of files) {
      let newContent: Buffer | string;
      const computedPath = computePath(
        srcFolder,
        target,
        filePath,
        substitutions,
      );

      if (tree.exists(computedPath)) {
        if (options.overwriteStrategy === OverwriteStrategy.KEEP_EXISTING) {
          continue;
        } else if (
          options.overwriteStrategy === OverwriteStrategy.THROW_ERROR_IF_EXISTS
        ) {
          throw new Error(
            `Generated file already exists, not allowed by overwrite strategy in generator (${computedPath})`,
          );
        }
        // else: file should be overwritten, so just fall through to file generation
      }

      if (isBinaryPath(filePath)) {
        newContent = readFileSync(filePath);
      } else {
        const template = readFileSync(filePath, 'utf8');
        try {
          newContent = ejs.render(template, substitutions, {
            filename: filePath,
          });
        } catch (error) {
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          logger.error(`Error in ${filePath.replace(`${tree.root}/`, '')}:`);
          throw error;
        }
      }

      tree.write(computedPath, newContent);
    }
  }
}

function computePath(
  srcFolder: string,
  target: string,
  filePath: string,
  substitutions: { [k: string]: unknown },
): string {
  const relativeFromSrcFolder = path.relative(srcFolder, filePath);
  let computedPath = path.join(target, relativeFromSrcFolder);
  if (computedPath.endsWith('.template')) {
    computedPath = computedPath.slice(0, Math.max(0, computedPath.length - 9));
  }
  for (const [propertyName, value] of Object.entries(substitutions)) {
    computedPath = computedPath.split(`__${propertyName}__`).join(value);
  }
  return computedPath;
}

function allFilesInDir(parent: string): string[] {
  let res: string[] = [];
  try {
    for (const c of readdirSync(parent)) {
      const child = path.join(parent, c);
      try {
        const s = statSync(child);
        if (!s.isDirectory()) {
          res.push(child);
        } else if (s.isDirectory()) {
          res = [...res, ...allFilesInDir(child)];
        }
      } catch {
        /* empty */
      }
    }
  } catch {
    /* empty */
  }
  return res;
}
