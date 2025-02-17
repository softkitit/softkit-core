import { ValidationParams } from '../validation';
import { FsTree } from '../../../service/tree';
import { WorkspaceContext } from '../../app-context/vo/app-environment.context';
import { AppContext } from '../../app-context/vo/app-context';

export type FieldType =
  // app root means that the generator have to be run in the root of the app,
  // and provided FsTree will be the root of the app itself
  | 'app-root'
  // app means that the generator just need to select some app from the workspace,
  // but FsTree will be the root of the app or the root of the workspace for monorepo or
  // just app for single app
  | 'app'
  | 'string'
  | 'number'
  | 'boolean'
  | string;

export type FieldValue<T extends FieldType> = T extends 'app' | 'app-root'
  ? AppContext
  : T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : unknown;

export interface GeneratorOption<T extends FieldType, R extends FieldValue<T>> {
  name: string;
  require: boolean;
  type: T;
  default?: R;
  array?: boolean;
  deprecated?: boolean | string;
  options?: string[];
  getOptions?: (fsTree: FsTree, workspaceContext: WorkspaceContext) => string[];
  validation?: ValidationParams<T>;
}
