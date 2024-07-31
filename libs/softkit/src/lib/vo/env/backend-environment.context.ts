import { Orm } from '../orm';
import { PluginInfo } from '../plugin-info';
import { BackendPackageType } from '../app-type';

export interface BackendEnvironmentContext {
  projectPath: string;
  appType: BackendPackageType;
  cleanGitChanges: boolean;

  /**
   * Main class for apps and index.ts for libraries
   * */
  entryPoint: string;

  // multiple potentially can be used
  orms?: Orm[];

  usedPlugins: PluginInfo[];
}
