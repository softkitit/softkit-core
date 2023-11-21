import { LocalstackStartedConfig } from './localstack-config';
import { StartedTestContainer } from 'testcontainers/build/test-container';

export type StartedLocalstack = {
  container: StartedTestContainer;
  localstackConfig: LocalstackStartedConfig;
};
