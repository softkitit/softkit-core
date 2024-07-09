import { existsSync } from 'node:fs';
import path from 'node:path';
import { getProfiles } from './get-profiles';
import {
  DEFAULT_CONFIGURATIONS_FOLDER_NAME,
  DEFAULT_CONFIGURATION_FILE_NAME,
} from '../constants';

export function getExistingFilePaths(
  baseDir: string,
  folderName = DEFAULT_CONFIGURATIONS_FOLDER_NAME,
  baseFileName = DEFAULT_CONFIGURATION_FILE_NAME,
  profiles = getProfiles(),
) {
  const fileNameSplit = baseFileName.split('.');
  const extension = fileNameSplit.at(-1);
  const justName = fileNameSplit.slice(0, -1).join('.');
  const profilePaths = profiles.map((p) => `${justName}-${p}.${extension}`);
  const files = [baseFileName, ...profilePaths];

  const existingFilePaths = [];
  const missingDetails = [];

  for (const name of files) {
    const filePath = path.join(baseDir, folderName, name);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (existsSync(filePath)) {
      existingFilePaths.push(filePath);
    } else {
      const profile = name.includes('env-')
        ? name.split('env-')[1].split('.')[0]
        : 'default';

      missingDetails.push(`'${profile}'`);
    }
  }

  if (missingDetails.length > 0 && existingFilePaths.length > 0) {
    const missingFilesList = missingDetails.join(', ');
    // eslint-disable-next-line no-console
    console.warn(
      `The following configuration files were not found in "${path.join(
        baseDir,
        folderName,
      )}" and will be skipped ${missingFilesList} profile`,
    );
  }

  if (existingFilePaths.length === 0) {
    throw new Error(
      `No configuration files found in "${path.join(
        baseDir,
        folderName,
      )}". Please check your configuration.`,
    );
  }

  return existingFilePaths;
}
