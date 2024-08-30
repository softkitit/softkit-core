import { ValidationParams } from './validation';
import { FsTree } from '../../../service/tree';
import { WorkspaceContext } from '../../app-context/vo/app-environment.context';
import { AppContext } from '../../app-context/vo/app-context';

export type FieldType = 'string' | 'number' | 'boolean' | string;

export interface GeneratorOption {
  name: string;
  require: boolean;
  type: FieldType;
  array?: boolean;
  deprecated?: boolean | string;

  options?: string[];

  getOptions?: (
    fsTree: FsTree,
    workspaceContext: WorkspaceContext,
    projectContext: AppContext,
  ) => string[];
  validation?: ValidationParams;
}
