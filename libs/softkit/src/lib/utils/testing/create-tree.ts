import { FsTree, Tree } from '../../service/tree';

/**
 * Creates a host for testing.
 */
export function createTree(): Tree {
  return new FsTree('/virtual');
}
