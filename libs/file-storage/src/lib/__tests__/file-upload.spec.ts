import { Test } from '@nestjs/testing';
import { S3_CLIENT_TOKEN } from '../constants';
import { AbstractFileService, S3FileService } from '../services';
import { faker } from '@faker-js/faker';
import { NoSuchKey, S3 } from '@aws-sdk/client-s3';
import axios from 'axios';
import { CompletedPartDTO } from '../controller/vo';
import { StartedLocalstack, startLocalstack } from '@softkit/test-utils';

function splitToNChunks(str: string, chunkSize: number) {
  const result = [];
  for (let i = 0; i < Math.ceil(str.length / chunkSize); i++) {
    result.push(str.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return result;
}

describe('file upload e2e test', () => {
  let s3: S3;
  let localstack: StartedLocalstack;
  let fileService: AbstractFileService;
  let s3FileService: S3FileService;
  const bucketName: string =
    'private-bucket-' + faker.string.alpha(10).toLowerCase();

  beforeAll(async () => {
    localstack = await startLocalstack();

    const { FileUploadAppModule } = require('./app/file-upload-app.module');

    const module = await Test.createTestingModule({
      imports: [FileUploadAppModule],
    }).compile();

    s3 = module.get<S3>(S3_CLIENT_TOKEN);
    fileService = module.get<AbstractFileService>(AbstractFileService);
    s3FileService = module.get<S3FileService>(S3FileService);

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

  it('should upload and download file successfully', async () => {
    const fileContent = 'test file content';
    const uploadResult = await fileService.uploadFile(
      bucketName,
      {
        originalFileName: 'test.txt',
      },
      fileContent,
    );

    const downloadedFile = await fileService.downloadFile(
      bucketName,
      uploadResult.key,
    );

    expect(fileContent).toBe(downloadedFile);
  });

  it('should upload and download file successfully with the options', async () => {
    const fileContent = 'test file content';
    const uploadResult = await s3FileService.uploadFile(
      bucketName,
      {
        originalFileName: 'test.pdf',
      },
      fileContent,
      undefined,
      {
        ContentType: 'application/pdf',
      },
    );

    const downloadedFile = await fileService.downloadFile(
      bucketName,
      uploadResult.key,
    );

    expect(fileContent).toBe(downloadedFile);
  });

  it('should upload, get pre-sign url, and download file using it successfully', async () => {
    const fileContent = 'test file content';
    const uploadResult = await fileService.uploadFile(
      bucketName,
      {
        originalFileName: 'test.txt',
      },
      fileContent,
    );

    const preSignUrl = await fileService.generateDownloadFilePreSignUrl(
      bucketName,
      uploadResult.key,
    );

    const result = await axios.get(preSignUrl);

    expect(result.data).toBe(fileContent);
  });

  it('should get pre-sign upload url, upload file, and then download it', async () => {
    const fileContent = 'test file content';

    const uploadUrl = await fileService.generateUploadFilePreSignUrlPost(
      bucketName,
      {
        originalFileName: 'test.txt',
      },
    );

    const bodyFormData = new FormData();
    bodyFormData.append('file', new Blob([fileContent]));

    for (const [field, value] of Object.entries(uploadUrl.fields)) {
      bodyFormData.append(field, value);
    }
    const axiosResponse = await axios({
      method: 'POST',
      url: uploadUrl.url,
      data: bodyFormData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    expect(axiosResponse.status).toBe(204);

    const downloadUploadedFile = await fileService.downloadFile(
      bucketName,
      uploadUrl.key,
    );

    expect(downloadUploadedFile).toBe(fileContent);
  });

  it.each([
    [faker.string.alphanumeric(129), '.txt', undefined],
    [faker.string.alphanumeric(10_000), '.txt', undefined],
    [faker.string.alphanumeric(10), '', undefined],
    [faker.string.alphanumeric(10), '.txt', undefined],
    [faker.string.alphanumeric(10), '.txt', faker.string.uuid()],
    [
      `${faker.string.alphanumeric(5)}/${faker.string.alphanumeric(5)}`,
      '.txt',
      faker.string.uuid(),
    ],
  ])(
    'should upload file using PUT pre-signed url, fileName: %s, extension: %s',
    async (fileName: string, extension: string, folder?: string) => {
      const fileContent = 'test file content';

      const uploadUrl = await fileService.generateUploadFilePreSignUrlPut(
        bucketName,
        {
          originalFileName: fileName + extension,
        },
        folder,
      );

      expect(uploadUrl.key.endsWith(extension)).toBe(true);
      expect(uploadUrl.key.startsWith(folder || '')).toBe(true);

      const fileContentBlob = new Blob([fileContent]);

      const axiosResponse = await axios({
        method: 'PUT',
        url: uploadUrl.url,
        data: fileContentBlob,
      });

      expect(axiosResponse.status).toBe(200);

      const downloadUploadedFile = await fileService.downloadFile(
        bucketName,
        uploadUrl.key,
      );

      expect(downloadUploadedFile).toBe(fileContent);
    },
  );

  it('should successfully do multi part upload', async () => {
    // 13mb file
    const fileContent = faker.string.alpha(13 * 1024 * 1024);

    const chunkSize = 6 * 1024 * 1024;
    const startMultipart = await fileService.startMultiPartUpload(
      bucketName,
      {
        originalFileName: 'test.txt',
        fileSize: fileContent.length,
      },
      chunkSize,
    );

    expect(startMultipart.partCount).toBe(3);

    const chunkedFile = splitToNChunks(fileContent, chunkSize);

    const partsUploadedInfo: CompletedPartDTO[] = [];

    for (const [i, element] of chunkedFile.entries()) {
      const fileContentBlob = new Blob([element]);

      const axiosResponse = await axios({
        method: 'PUT',
        url: startMultipart.uploadUrls[i],
        data: fileContentBlob,
      });

      expect(axiosResponse.status).toBe(200);
      expect(axiosResponse.headers['etag']).toBeDefined();

      partsUploadedInfo.push({
        eTag: axiosResponse.headers['etag'],
        partNumber: i + 1,
      });
    }

    await fileService.completeMultiPartUpload(
      startMultipart.uploadId,
      bucketName,
      startMultipart.key,
      partsUploadedInfo,
    );

    const downloadUploadedFile = await fileService.downloadFile(
      bucketName,
      startMultipart.key,
    );

    expect(downloadUploadedFile).toBe(fileContent);
  }, 60_000);

  it('should abort multi part upload without creating a file', async () => {
    // 7mb file
    const fileContent = faker.string.alpha(7 * 1024 * 1024);

    const startMultipart = await fileService.startMultiPartUpload(bucketName, {
      originalFileName: 'test.txt',
      fileSize: fileContent.length,
    });

    expect(startMultipart.partCount).toBe(2);

    const chunkedFile = splitToNChunks(fileContent, 5 * 1024 * 1024);

    for (const [i, element] of chunkedFile.entries()) {
      const fileContentBlob = new Blob([element]);

      const axiosResponse = await axios({
        method: 'PUT',
        url: startMultipart.uploadUrls[i],
        data: fileContentBlob,
      });

      expect(axiosResponse.status).toBe(200);
      expect(axiosResponse.headers['etag']).toBeDefined();
    }

    await fileService.abortMultiPartUpload(
      startMultipart.uploadId,
      bucketName,
      startMultipart.key,
    );

    await expect(
      fileService.downloadFile(bucketName, startMultipart.key),
    ).rejects.toThrow(NoSuchKey);
  }, 60_000);
});
