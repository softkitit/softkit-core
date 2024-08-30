import process from 'node:process';

const env = {
  SK_VERBOSE_LOGGING: 'SK_VERBOSE_LOGGING',
  SK_APP_ROOT_PATH: 'SK_APP_ROOT_PATH',
  SK_PREFER_TS_NODE: 'SK_PREFER_TS_NODE',
};

export function getAppRootPathEnv() {
  return process.env[env.SK_APP_ROOT_PATH];
}

export function setAppRootPathEnv(path: string) {
  process.env[env.SK_APP_ROOT_PATH] = path;
}

export function isPreferTsNode() {
  return process.env[env.SK_PREFER_TS_NODE] === 'true';
}

export function isVerbose(): boolean {
  return process.env[env.SK_VERBOSE_LOGGING] === 'true';
}

export function setVerbose(verbose: boolean) {
  process.env[env.SK_VERBOSE_LOGGING] = verbose + '';
}
