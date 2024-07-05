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
import {
  FileDataRequest,
  PreSignedResponse,
  UploadPresignRequest,
} from '../controller/vo';
import { faker } from '@faker-js/faker';

const generateFileNames = (count: number, folder?: string) => {
  const res: FileDataRequest[] = [];

  for (let i = 1; i <= count; i++) {
    res.push({
      originalFileName: `test-file-${i}.txt`,
      ...(folder ? { folder } : {}),
    });
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

  it.each([
    {
      filesData: generateFileNames(4),
    },
    {
      filesData: generateFileNames(4, faker.string.uuid()),
    },
  ])(
    `should get presign url successfully, POST ${baseController}/get-upload-presign-url`,
    async ({ filesData }) => {
      const response = await app.inject({
        method: 'POST',
        url: `${baseController}/get-upload-presign-url`,
        payload: {
          filesData,
        } as UploadPresignRequest,
      });
      expect(response.statusCode).toEqual(HttpStatus.OK);

      const createResponseBody = response.json<PreSignedResponse[]>();

      expect(createResponseBody.length).toBe(4);

      for (const [index, resBody] of createResponseBody.entries()) {
        expect(resBody.key).toContain(filesData[index].originalFileName);
        expect(resBody.preSignedUrl).toContain(
          filesData[index].originalFileName,
        );
        expect(resBody.originalFileName).toBe(
          filesData[index].originalFileName,
        );
        expect(
          resBody.key.startsWith(filesData[index].folder || ''),
        ).toBeTruthy();
      }
    },
  );

  it.each([
    {
      filesData: [],
    },
    {
      filesData: generateFileNames(22),
    },
  ])(
    `could not get presign url, because of the error. POST ${baseController}/get-upload-presign-url`,
    async ({ filesData }) => {
      const response = await app.inject({
        method: 'POST',
        url: `${baseController}/get-upload-presign-url`,
        payload: {
          filesData,
        } as UploadPresignRequest,
      });

      expect(response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    },
  );

  it.each([
    [undefined],
    ['folder1'],
    ['folder1/folder2'],
    ['f/f/f/f/f/f/ff/f/'],
  ])(
    `should download file successfully, GET ${baseController}/download-file/%s/test.txt`,
    async (folder) => {
      const fileContent = 'test file content';
      const uploadResult = await fileService.uploadFile(
        bucketName,
        {
          originalFileName: 'test.txt',
        },
        fileContent,
        folder,
      );

      const response = await app.inject({
        method: 'GET',
        url: `${baseController}/download-file/${uploadResult.key}`,
      });

      expect(response.statusCode).toEqual(HttpStatus.TEMPORARY_REDIRECT);
      expect(response.headers).toBeDefined();
      expect(response.headers['location']).toBeDefined();

      const result = await axios.get(response.headers['location']!.toString());

      expect(result.data).toBe(fileContent);
    },
  );

  it(`should download file, but the link returns an error GET ${baseController}/download-file/:key`, async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${baseController}/download-file/test-file.txt`,
    });

    expect(response.statusCode).toEqual(HttpStatus.TEMPORARY_REDIRECT);
    expect(response.headers).toBeDefined();
    expect(response.headers['location']).toBeDefined();

    await expect(
      axios.get(response.headers['location']!.toString()),
    ).rejects.toThrow();
  });
});
