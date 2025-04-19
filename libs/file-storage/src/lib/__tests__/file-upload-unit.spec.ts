import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { S3FileService } from '../services';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';

describe('file upload unit test', () => {
  it('should throw FileNotFoundException when S3 getObject returns object with Body undefined', async () => {
    const bucketName: string =
      'private-bucket-' + faker.string.alpha(10).toLowerCase();

    const mockedGetObject = jest.fn().mockResolvedValueOnce({
      Body: undefined,
    });
    // Mock S3 getObject to return object with Body undefined
    const mock = jest.mock('@aws-sdk/client-s3', () => {
      return {
        S3: jest.fn().mockImplementation(() => ({
          getObject: mockedGetObject,
        })),
      };
    });

    const { FileUploadAppModule } = require('./app/file-upload-app.module');

    const module = await Test.createTestingModule({
      imports: [FileUploadAppModule],
    }).compile();

    const fileService = module.get(S3FileService);

    const key = 'test-file-' + faker.string.uuid();

    // Expect downloadStream to throw FileNotFoundException
    await expect(fileService.downloadStream(bucketName, key)).rejects.toThrow(
      FileNotFoundException,
    );

    // Verify that getObject was called with the correct parameters
    expect(mockedGetObject).toHaveBeenCalledWith({
      Bucket: bucketName,
      Key: key,
    });

    // Restore the original implementation
    mock.restoreAllMocks();
  });
});
