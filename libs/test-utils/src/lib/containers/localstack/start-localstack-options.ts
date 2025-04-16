export type StartLocalstackOptions = {
  imageName: string;
  imageTag: string;
  services: string[];
  ports: number[];
};

export const DEFAULT_START_LOCALSTACK_OPTIONS: StartLocalstackOptions = {
  imageName: 'localstack/localstack',
  imageTag: '3.0.0',
  services: ['s3'],
  ports: [4566],
};
