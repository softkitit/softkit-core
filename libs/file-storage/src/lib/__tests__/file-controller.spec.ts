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
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { PreSignedResponse } from '../controller/vo/pre-assign.dto';

const generateFileNames = (count: number) => {
  const res: string[] = [];

  for (let i = 1; i <= count; i++) {
    res.push(`test-file-${i}.txt`);
  }

  return res;
};

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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

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

  it(`should get pre assign url successfully, POST ${baseController}/get-upload-pre-assign-url`, async () => {
    const originalFileNames = generateFileNames(4);

    const response = await app.inject({
      method: 'POST',
      url: `${baseController}/get-upload-pre-assign-url`,
      payload: {
        originalFileNames,
      },
    });
    expect(response.statusCode).toEqual(HttpStatus.OK);

    const createResponseBody = response.json<PreSignedResponse[]>();

    expect(createResponseBody.length).toBe(4);

    for (const [index, resBody] of createResponseBody.entries()) {
      expect(resBody.key).toContain(originalFileNames[index]);
      expect(resBody.preSignedUrl).toContain(originalFileNames[index]);
      expect(resBody.originalFileName).toBe(originalFileNames[index]);
    }
  });

  it.each([
    {
      originalFileNames: [],
    },
    {
      originalFileNames: generateFileNames(22),
    },
  ])(
    `should not get pre assign url, because of the error. POST ${baseController}/get-upload-pre-assign-url`,
    async ({ originalFileNames }) => {
      const response = await app.inject({
        method: 'POST',
        url: `${baseController}/get-upload-pre-assign-url`,
        payload: {
          originalFileNames,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    },
  );

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

  it(`should download file, but the link returns an error POST ${baseController}/download-file`, async () => {
    const response = await app.inject({
      method: 'POST',
      url: `${baseController}/download-file`,
      payload: {
        key: 'test-file.txt',
      },
    });

    expect(response.statusCode).toEqual(HttpStatus.MOVED_PERMANENTLY);
    expect(response.headers).toBeDefined();
    expect(response.headers['location']).toBeDefined();

    await expect(
      axios.get(response.headers['location']!.toString()),
    ).rejects.toThrow();
  });
});
