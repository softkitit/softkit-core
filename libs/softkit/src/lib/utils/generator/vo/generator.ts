import { FsTree } from '../../../service/tree';
import { WorkspaceContext } from '../../app-context/vo/app-environment.context';
import { GeneratorOption } from './generator-option';
import { AppContext } from '../../app-context/vo/app-context';

/**
 * A callback function that is executed after changes are made to the file system
 */
export type GeneratorCallback = () => void | Promise<void>;

export interface Generator<T, PC extends AppContext = AppContext> {
  generate(
    fs: FsTree,
    workspaceContext: WorkspaceContext,
    options?: T,
    pc?: PC,
  ): void | GeneratorCallback | Promise<void | GeneratorCallback>;

  getInputs(): GeneratorOption[];
}
