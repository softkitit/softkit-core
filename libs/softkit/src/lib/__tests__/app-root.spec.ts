import * as fileUtils from '../utils/file/fileutils';
import { findAppRootInner } from '../utils/file/app-root-path';

const rootMarkers = ['sk.json'];

describe('workspaceRootInner', () => {
  it.each(rootMarkers)('should find workspace root from %s', (marker) => {
    jest
      .spyOn(fileUtils, 'fileExists')
      .mockImplementation((p) =>
        [
          `/home/workspace/${marker}`,
          '/home/workspace/packages/a/package.json',
          '/home/workspace/packages/b/package.json',
          '/home/workspace/packages/c/package.json',
        ].includes(p.toString()),
      );

    expect(findAppRootInner('/home/workspace')).toEqual('/home/workspace');
  });

  it.each(rootMarkers)(
    'should find workspace root from %s when in subpackage',
    (marker) => {
      jest
        .spyOn(fileUtils, 'fileExists')
        .mockImplementation((p) =>
          [
            `/home/workspace/${marker}`,
            '/home/workspace/packages/a/package.json',
            '/home/workspace/packages/b/package.json',
            '/home/workspace/packages/c/package.json',
          ].includes(p.toString()),
        );

      expect(findAppRootInner('/home/workspace/packages/a')).toEqual(
        '/home/workspace',
      );
    },
  );

  it.each(rootMarkers)(
    'should prefer workspace root from %s when in subpackage containing sk',
    (marker) => {
      jest
        .spyOn(fileUtils, 'fileExists')
        .mockImplementation((p) =>
          [
            `/home/workspace/${marker}`,
            '/home/workspace/packages/a/node_modules/sk/package.json',
            '/home/workspace/packages/a/package.json',
            '/home/workspace/packages/b/package.json',
            '/home/workspace/packages/c/package.json',
          ].includes(p.toString()),
        );

      expect(findAppRootInner('/home/workspace/packages/a')).toEqual(
        '/home/workspace',
      );
    },
  );
});
