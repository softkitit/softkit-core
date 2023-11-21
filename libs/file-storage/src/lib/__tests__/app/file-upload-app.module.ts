import { Module } from '@nestjs/common';
import { S3FileStorageModule } from '../../s3-file-storage.module';

@Module({
  imports: [
    S3FileStorageModule.forRoot({
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      forcePathStyle: true,
      endpoint: `http://localhost:${process.env['TEST_LOCALSTACK_MAIN_PORT']}`,
      region: 'us-west-1',
    }),
  ],
})
export class FileUploadAppModule {}
