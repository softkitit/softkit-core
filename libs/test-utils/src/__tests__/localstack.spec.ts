import { startLocalstack } from '../lib/start-localstack';
import { S3 } from '@aws-sdk/client-s3';

describe('start localstack and create config', () => {
  it('should start and stop localstack', async () => {
    const { localstackConfig, container } = await startLocalstack();

    try {
      expect(localstackConfig.ports).toBeDefined();
      expect(localstackConfig.host).toBeDefined();

      const s3Client = new S3({
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
        forcePathStyle: true,
        endpoint: `http://localhost:${localstackConfig.ports[4566]}`,
        region: 'us-west-1',
      });

      const bucketName = 'test-bucket';
      await s3Client.createBucket({
        Bucket: bucketName,
        ACL: 'private',
        CreateBucketConfiguration: {
          LocationConstraint: 'us-west-1',
        },
      });

      const buckets = await s3Client.listBuckets({});

      expect(buckets.Buckets?.length).toBe(1);

      expect((buckets.Buckets || [])[0].Name).toBe(bucketName);

      expect(container).toBeDefined();
    } finally {
      const stoppedTestContainer = await container.stop();
      expect(stoppedTestContainer).toBeDefined();
    }
  }, 360_000);
});
