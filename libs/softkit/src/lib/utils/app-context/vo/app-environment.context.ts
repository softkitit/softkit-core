import { PackageManagerType } from '../../../vo/package-manager';
import { MonorepoManagerType } from '../../../vo/monorepo-manager-type';
import { AppContext } from './app-context';

export interface WorkspaceContext {
  monorepoManager?: MonorepoManagerType;
  apps: AppContext[];
  packageManager: PackageManagerType;
}
