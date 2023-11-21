import { StartedLocalstack, startLocalstack } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { S3FileStorageModule } from '../s3-file-storage.module';
import { S3_CLIENT_TOKEN } from '../constants';
import { S3 } from '@aws-sdk/client-s3';
import { S3ClientConfig } from '@aws-sdk/client-s3/dist-types/S3Client';
import { Global, Module, Type } from '@nestjs/common';

function buildS3Config(port: string): S3ClientConfig {
  return {
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
    endpoint: `http://localhost:${port}`,
    region: 'us-west-1',
  };
}

describe('file upload module async configuration', () => {
  let localstack: StartedLocalstack;
  let exposedPort: string;
  let testModule: Type<unknown>;

  const PORT_TOKEN = 'TEST_LOCALSTACK_MAIN_PORT';

  beforeAll(async () => {
    localstack = await startLocalstack();
    exposedPort = process.env[PORT_TOKEN]!;

    @Module({
      providers: [
        {
          provide: PORT_TOKEN,
          useValue: exposedPort,
        },
      ],
      exports: [PORT_TOKEN],
    })
    @Global()
    class TestModule {}

    testModule = TestModule;
  }, 120_000);

  afterAll(async () => {
    await localstack.container.stop();
  });

  it('should initial using useFactory and no deps', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        S3FileStorageModule.forRootAsync({
          useFactory: async () => {
            return buildS3Config(exposedPort);
          },
        }),
      ],
    }).compile();

    const s3 = testingModule.get<S3>(S3_CLIENT_TOKEN);

    const buckets = await s3.listBuckets({});

    expect(buckets.Buckets?.length).toBe(0);
  });

  it('should start using useFactory and populate a port from another global module', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        testModule,
        S3FileStorageModule.forRootAsync({
          useFactory: async (port: string) => {
            return buildS3Config(port);
          },
          inject: [PORT_TOKEN],
        }),
      ],
    }).compile();

    const s3 = testingModule.get<S3>(S3_CLIENT_TOKEN);

    const buckets = await s3.listBuckets({});

    expect(buckets.Buckets?.length).toBe(0);
  });
});
