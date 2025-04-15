import { fs } from 'memfs';
import { createDirectory, isRelativePath } from '../utils/file/fileutils';

jest.mock('node:fs', () => fs);

describe('fileutils', () => {
  describe(`createDirectory`, () => {
    it('should recursively create the directory', () => {
      createDirectory('/root/b/c');
      expect(fs.statSync('/root').isDirectory()).toBe(true);
      expect(fs.statSync('/root/b').isDirectory()).toBe(true);
      expect(fs.statSync('/root/b/c').isDirectory()).toBe(true);
    });
  });

  describe(`isRelativePath`, () => {
    it('should return true for deeper imports', () => {
      expect(isRelativePath('.')).toEqual(true);
      expect(isRelativePath('./file')).toEqual(true);
    });
    it('should return true for upper imports', () => {
      expect(isRelativePath('..')).toEqual(true);
      expect(isRelativePath('../file')).toEqual(true);
    });
    it('should return false for absolute imports', () => {
      expect(isRelativePath('file')).toEqual(false);
      expect(isRelativePath('@sk/angular')).toEqual(false);
    });
  });
});
