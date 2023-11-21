# File Storage module

This library is a default practical implementation for working with file, to cover most application default needs and do not deep dive in a generalized AWS SDK API, that sometimes is hard to follow and use, even if you know what to do.
Also, it generalized in a way that can be used and extended for other cloud storage, but now contains implementation only for S3, using the latest API V3.

## Features

- It provides S3FileStorageModule
- Exposed S3 client
- And high-level file service
- Use of default AWS credentials chain
- Pre-sign URL generation for POST and PUT methods for upload, and GET method for download
- Multipart upload with start/stop/complete methods 

TBD: 

- Add default controller for file upload and download
- Add a storage repository for optionally storing file metadata
- Add a cron job for cleaning up unused files
- Add encryption for securely passing information from frontend and do not store and expose any S3 information 

## Installation

```bash
yarn add @softkit/file-storage
```

## Usage

### Import S3FileStorageModule 

```typescript

import { Module } from '@nestjs/common';
import { S3FileStorageModule } from '@softkit/file-storage';

@Module({
  imports: [
    S3FileStorageModule.forRoot(),
  ],
})
export class YourAppModule {}

```
Note: 

If you have AWS cli configured locally, it will use your local credentials
You can override credentials in code 


```typescript

import { Module } from '@nestjs/common';
import { S3FileStorageModule } from '@softkit/file-storage';

@Module({
  imports: [
    S3FileStorageModule.forRoot({
      credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
      }
    }),
  ],
})
export class YourAppModule {}

```

Or use forRootAsync if you want to inject some config

```typescript

@Module({
  imports: [
    S3FileStorageModule.forRootAsync({
      useFactory: async (config: SomeS3Config) => {
        return config;
      },
      inject: [SomeS3Config],
    }),
  ],
})
export class YourAppModule {}

```

Or simply set environment variables: 

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-west-2
```


## Testing 

You can use @softkit/test-utils module that allow to easily start localstack and test your code with it. 

startLocalstack function setting TEST_LOCALSTACK_MAIN_PORT env variable, and you can substitute it in your config file. 

```typescript
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
```






