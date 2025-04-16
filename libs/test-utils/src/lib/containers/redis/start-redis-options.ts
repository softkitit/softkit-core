export type StartRedisOptions = {
  imageName: string;
  imageTag: string;
};

export const DEFAULT_START_REDIS_OPTIONS: StartRedisOptions = {
  imageName: 'redis',
  imageTag: '7.2.1-alpine3.18',
};
