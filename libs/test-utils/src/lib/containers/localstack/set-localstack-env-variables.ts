import { LocalstackStartedConfig } from './localstack-config';

export async function setTestEnvironmentForLocalstack(
  config: LocalstackStartedConfig,
) {
  process.env['TEST_LOCALSTACK_MAIN_PORT'] = config.mainPort + '';
}
