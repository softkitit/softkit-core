import { PackageJson } from '../../../vo/package-json';

export interface PluginInfo {
  packageJson: PackageJson & {
    sk: {
      generators: string;
    };
  };
  local: boolean;
  path: string;
}
