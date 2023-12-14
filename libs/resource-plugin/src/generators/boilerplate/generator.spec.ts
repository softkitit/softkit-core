/* eslint-disable security/detect-non-literal-fs-filename */
import { createTree } from '@nx/devkit/testing';
import { Tree, joinPathFragments } from '@nx/devkit';
import { boilerplateGenerator } from './generator';

import { BoilerplateGeneratorSchema } from './schema';
import { generateRandomIdWithoutSpecialCharacters } from '@softkit/crypto';
import { rimrafSync } from 'rimraf';
import { readFileSync, readdirSync } from 'node:fs';
import * as os from 'node:os';

const folderName = generateRandomIdWithoutSpecialCharacters();
const root = `${os.tmpdir()}/${folderName}`;

describe('boilerplate generator', () => {
  let tree: Tree;

  const options: BoilerplateGeneratorSchema = {
    appFolder: root,
    companyName: 'randomCompanyName',
    tag: '0.0.1',
    repository: 'https://github.com/softkitit/softkit-nestjs-boilerplate.git',
  };

  beforeEach(() => {
    tree = createTree();
  });

  afterEach(() => {
    rimrafSync(root);
  });

  it('should clone boilerplate and modify package.json successfully', async () => {
    await boilerplateGenerator(tree, options);

    const files = readdirSync(root);
    expect(files.length).toBe(26);

    const assetsFiles = readdirSync(`${root}/apps/platform/src/app/assets`);
    expect(assetsFiles.length).toBe(4);

    const appTestsFiles = readdirSync(
      `${root}/apps/platform/src/app/__tests__`,
    );
    expect(appTestsFiles.length).toBe(6);

    const databaseFiles = readdirSync(`${root}/apps/platform/src/app/database`);
    expect(databaseFiles.length).toBe(4);

    const i18nFiles = readdirSync(`${root}/apps/platform/src/app/i18n/en`);
    expect(i18nFiles.length).toBe(2);

    const packageJsonPath = joinPathFragments(root, 'package.json');

    const fileContents = readFileSync(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(fileContents);

    expect(packageJson.name).toBe(`@${options.companyName}/source`);
  }, 120_000);

  it('should fail without existing tag', async () => {
    await expect(
      boilerplateGenerator(tree, {
        ...options,
        tag: 'randomTagThatDoesNotExist',
      }),
    ).rejects.toBe(128);
  });
});
