import { PackageManager } from '../package-manager';
import { MonorepoManager } from '../monorepo-manager';

export interface AppEnvironmentContext {
  monorepoManager?: MonorepoManager;

  /**
   * List of one or more paths to the root of the projects.
   * Usually it's just one path, but for nx it can be libs and apps and maybe packages folders.
   * */
  projectsRoot: string[];
  nodeVersion: string;
  packageManager?: PackageManager;
}
