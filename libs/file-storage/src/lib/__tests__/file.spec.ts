import { S3 } from '@aws-sdk/client-s3';
import { StartedLocalstack, startLocalstack } from '@softkit/test-utils';
import { Test } from '@nestjs/testing';
import { S3_CLIENT_TOKEN } from '../constants';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AbstractFileService } from '../services';
import axios from 'axios';
import { HttpStatus } from '@nestjs/common';
import { PreAssignResponse } from '../controller/vo/pre-assign.dto';

describe('file controller e2e test', () => {
  let s3: S3;
  let app: NestFastifyApplication;
  let localstack: StartedLocalstack;
  let fileService: AbstractFileService;
  const bucketName: string = 'private-bucket-test';
  const baseController = `file`;

  beforeAll(async () => {
    localstack = await startLocalstack();

    const { FileUploadAppModule } = require('./app/file-upload-app.module');

    const module = await Test.createTestingModule({
      imports: [FileUploadAppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.listen(0);

    s3 = module.get<S3>(S3_CLIENT_TOKEN);
    fileService = module.get<AbstractFileService>(AbstractFileService);

    await s3.createBucket({
      Bucket: bucketName,
      ACL: 'private',
      CreateBucketConfiguration: {
        LocationConstraint: 'us-west-1',
      },
    });
  }, 120_000);

  afterAll(async () => {
    await localstack.container.stop();
  });

  it(`should get pre assign url successfully, POST ${baseController}/get-pre-assign-url`, async () => {
    const originalFileNames = [
      'test-file-1.txt',
      'test-file-2.txt',
      'test-file-3.txt',
      'test-file-4.txt',
    ];

    const response = await app.inject({
      method: 'POST',
      url: `${baseController}/get-pre-assign-url`,
      payload: {
        originalFileNames,
      },
    });
    expect(response.statusCode).toEqual(HttpStatus.OK);

    const createResponseBody = response.json<PreAssignResponse[]>();

    expect(createResponseBody.length).toBe(4);
    expect(createResponseBody[0].fileName).toContain(originalFileNames[0]);
    expect(createResponseBody[0].preAssignUrl).toContain(originalFileNames[0]);
    expect(createResponseBody[1].fileName).toContain(originalFileNames[1]);
    expect(createResponseBody[1].preAssignUrl).toContain(originalFileNames[1]);
    expect(createResponseBody[3].fileName).toContain(originalFileNames[3]);
    expect(createResponseBody[3].preAssignUrl).toContain(originalFileNames[3]);
  });

  it(`should download file successfully, POST ${baseController}/download-file`, async () => {
    const fileContent = 'test file content';
    const uploadResult = await fileService.uploadFile(
      bucketName,
      {
        originalFileName: 'test.txt',
      },
      fileContent,
    );

    const response = await app.inject({
      method: 'POST',
      url: `${baseController}/download-file`,
      payload: {
        key: uploadResult.key,
      },
    });

    expect(response.statusCode).toEqual(HttpStatus.MOVED_PERMANENTLY);
    expect(response.headers).toBeDefined();
    expect(response.headers['location']).toBeDefined();

    const result = await axios.get(response.headers['location']!.toString());

    expect(result.data).toBe(fileContent);
  });
});
