import { AppType } from './app-type';
import { AppContext } from './app-context';

export interface FrontEndProjectContext extends AppContext {
  projectType: AppType.FRONTEND;
}
