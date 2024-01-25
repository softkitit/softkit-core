import { existsSync } from 'node:fs';
import path from 'node:path';

export function getExistingFilePaths(
  baseDir: string,
  folderName: string,
  baseFileName: string,
  profiles: string[],
) {
  const fileNameSplit = baseFileName.split('.');
  const extension = fileNameSplit.at(-1);
  const justName = fileNameSplit.slice(0, -1).join('.');
  const profilePaths = profiles.map((p) => `${justName}-${p}.${extension}`);
  const files = [baseFileName, ...profilePaths];

  const existingFilePaths = [];
  const missingFilePaths = [];

  for (const name of files) {
    const filePath = path.join(baseDir, folderName, name);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (existsSync(filePath)) {
      existingFilePaths.push(filePath);
    } else {
      missingFilePaths.push(filePath);
    }
  }

  if (missingFilePaths.length > 0) {
    const missingFilesList = missingFilePaths.join('\n');
    // eslint-disable-next-line no-console
    console.warn(
      `The following configuration files were not found and will be skipped:\n${missingFilesList}`,
    );
  }

  if (existingFilePaths.length === 0) {
    throw new Error(
      'No configuration files found. Please check your configuration.',
    );
  }

  return existingFilePaths;
}
