import { LocalstackStartedConfig } from '../vo/localstack/localstack-config';

export async function setTestEnvironmentForLocalstack(
  config: LocalstackStartedConfig,
) {
  process.env['TEST_LOCALSTACK_MAIN_PORT'] = config.mainPort + '';
}
