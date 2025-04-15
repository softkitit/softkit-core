import { PackageJson } from '../../vo/package-json';
import { AppType, Framework } from './vo/app-type';
import { logger } from '../logger';

export function detectAppTypeAndFramework(
  packageJson: PackageJson | undefined,
) {
  const allDeps = {
    ...packageJson?.dependencies,
    ...packageJson?.peerDependencies,
    ...packageJson?.optionalDependencies,
  };

  const frameworks: Framework[] = [];

  let appType: AppType | undefined;

  /**
   * Backend frameworks going first because they are more specific,
   * and in some cases React can be used in the backend e.g. PDF generation
   * but backend frameworks can't be used in the frontend, so we need to prioritize backend frameworks
   * */
  if (allDeps['@nestjs/common'] || allDeps['@nestjs/core']) {
    appType ??= AppType.BACKEND;
    frameworks.push(Framework.NESTJS);
  }

  if (allDeps['@angular/core']) {
    appType ??= AppType.FRONTEND;
    frameworks.push(Framework.ANGULAR);
  }

  if (allDeps['react']) {
    appType ??= AppType.FRONTEND;
    frameworks.push(Framework.REACT);
  }

  if (allDeps['vue']) {
    appType ??= AppType.FRONTEND;
    frameworks.push(Framework.VUE);
  }

  if (!appType) {
    logger.verbose('App type and frameworks not detected');
  }

  return {
    appType: appType ?? AppType.UNKNOWN,
    frameworks,
  };
}
