import { Tree, logger, updateJson } from '@nx/devkit';

import { BoilerplateGeneratorSchema } from './schema';
import { cloneRepo } from '../common/clone-repo';
import { flushChanges } from 'nx/src/generators/tree';

async function updatePackageJson(tree: Tree, scopeName: string) {
  const packageJsonPath = 'package.json';
  logger.info(`Updating package.json at ${packageJsonPath}`);

  updateJson(tree, packageJsonPath, (json) => {
    json.name = `@${scopeName}/source`;
    return json;
  });
}

export async function platformGenerator(
  _: Tree,
  options: BoilerplateGeneratorSchema,
) {
  const root = options.appFolder;
  options.companyName = options.companyName.toLowerCase().trim();

  logger.info(`Cloning repository into ${root}...`);
  const fsTree = await cloneRepo(root, options.tag, options.repository);

  await updatePackageJson(fsTree, options.companyName);

  flushChanges(root, fsTree.listChanges());
}

export default platformGenerator;
