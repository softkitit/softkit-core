import * as path from 'node:path';
import * as nodefs from 'node:fs';
import { fs } from 'memfs';

/**
 * Copies all directories and files from real FS to memfs.
 * @param fsReal
 * @param fsMem
 * @param {string} sourcePath - The source directory in real FS (e.g., './my-dir').
 * @param {string} destPath - The destination path in memfs (e.g., '/mem-dir').
 */
export function copyRealFsToMemfs(
  fsReal: typeof nodefs,
  fsMem: typeof fs,
  sourcePath: string,
  destPath: string,
) {
  // Ensure sourcePath exists in real FS
  if (!fsReal.existsSync(sourcePath)) {
    throw new Error(`Source path "${sourcePath}" does not exist in real FS`);
  }

  // Get stats to determine if sourcePath is a file or directory
  const stats = fsReal.statSync(sourcePath);

  if (stats.isFile()) {
    // If it's a file, read its contents and write to memfs
    const fileContent = fsReal.readFileSync(sourcePath);
    fsMem.writeFileSync(destPath, fileContent);
    return;
  }

  // If it's a directory, create it in memfs
  fsMem.mkdirSync(destPath, { recursive: true });

  // Read all entries in the directory
  const entries = fsReal.readdirSync(sourcePath, { withFileTypes: true });

  // Iterate over each entry
  for (const entry of entries) {
    const srcEntryPath = path.join(sourcePath, entry.name);
    const destEntryPath = path.join(destPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyRealFsToMemfs(fsReal, fsMem, srcEntryPath, destEntryPath);
    } else if (entry.isFile()) {
      // Copy files
      const fileContent = fsReal.readFileSync(srcEntryPath);
      fsMem.writeFileSync(destEntryPath, fileContent);
    }
    // Note: This skips symlinks, sockets, etc. Add handling if needed.
  }
}
