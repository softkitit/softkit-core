import { Tree } from '../../../service/tree';
import { WorkspaceContext } from '../../app-context/vo/app-environment.context';
import { FieldType, GeneratorOption } from './generator-option';

/**
 * A callback function that is executed after changes are made to the file system
 */
export type GeneratorCallback = () => void | Promise<void>;

export interface Generator<T> {
  generate(
    fs: Tree,
    workspaceContext: WorkspaceContext,
    options?: T,
  ): void | GeneratorCallback | Promise<void | GeneratorCallback>;

  getInputs(): GeneratorOption<FieldType, unknown>[];

  getGeneratorDescription?(): string;
}
