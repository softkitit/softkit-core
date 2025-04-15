import { Orm } from '../../../vo/orm';
import { AppType } from './app-type';
import { AppContext } from './app-context';

export interface BackendProjectContext extends AppContext {
  // multiple potentially can be used
  orms?: Orm[];
  projectType: AppType.BACKEND;
}
