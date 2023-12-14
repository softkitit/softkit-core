import { joinPathFragments, logger, Tree } from '@nx/devkit';
import { FsTree } from 'nx/src/generators/tree';

export function updateTypeScriptConfigurations(
  tree: Tree,
  rootPath: string,
  workspaceRootPath: string,
) {
  const globalDtsPath = joinPathFragments(workspaceRootPath, './global.d.ts');
  const fsTree = new FsTree(rootPath, true);

  const tsConfigFilePath = joinPathFragments(rootPath, 'tsconfig.spec.json');
  const tsConfigContent = tree.read(tsConfigFilePath, 'utf8');
  const tsConfig = JSON.parse(tsConfigContent);
  tsConfig.include.push(globalDtsPath);
  tree.write(tsConfigFilePath, JSON.stringify(tsConfig, undefined, 2));

  updateGlobalDtsFile(globalDtsPath, tree);
  return fsTree;
}

function updateGlobalDtsFile(globalDtsPath: string, tree: Tree) {
  const jestExtendedReference = '/// <reference types="jest-extended" />';

  if (tree.exists(globalDtsPath)) {
    const fileContent = tree.read(globalDtsPath, 'utf8');
    if (!fileContent.includes(jestExtendedReference)) {
      tree.write(globalDtsPath, fileContent + jestExtendedReference);
    }
  } else {
    tree.write('./global.d.ts', `${jestExtendedReference}\n`);
    logger.info(
      `Created global.d.ts with the required reference at ${globalDtsPath}.`,
    );
  }
}
