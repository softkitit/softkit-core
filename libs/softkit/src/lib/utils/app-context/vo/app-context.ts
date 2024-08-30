/*
 * General app context for apps and libs
 * */
import { AppType, Framework } from './app-type';
import { PackageJson } from '../../../vo/package-json';
import { PluginInfo } from '../../plugins/vo/plugin-info';

export interface AppContext {
  name?: string;
  path: string;

  appType: AppType;
  frameworks?: Framework[];

  packageJson: PackageJson;
  hasBuiltInPlugin: boolean;

  usedPlugins: PluginInfo[];
}
