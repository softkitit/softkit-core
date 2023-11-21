import { Inject, Injectable } from '@nestjs/common';
import { S3_CLIENT_TOKEN } from '../constants';
import {
  GetObjectCommand,
  S3,
  PutObjectCommand,
  PutObjectCommandInput,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { AbstractFileService } from './abstract-file.service';
import {
  FileDefinition,
  FileUploadPreSignUrlPostResult,
  FileUploadPreSignUrlPutResult,
  StartMultipartUploadInfo,
  UploadedFileInfo,
} from './vo/file-definition';
import { CompletedPartDTO } from '../controller/vo';
import consumers from 'node:stream/consumers';
import { CreateMultipartUploadCommandInput } from '@aws-sdk/client-s3/dist-types/commands/CreateMultipartUploadCommand';
import { generateRandomId } from '@softkit/crypto';
import { AbortMultipartUploadCommandInput } from '@aws-sdk/client-s3/dist-types/commands/AbortMultipartUploadCommand';
import { CompleteMultipartUploadCommandInput } from '@aws-sdk/client-s3/dist-types/commands/CompleteMultipartUploadCommand';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NodeJsRuntimeStreamingBlobPayloadInputTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-payload-input-types';
import type { NodeJsClient } from '@smithy/types';

@Injectable()
export class S3FileService extends AbstractFileService {
  protected DEFAULT_UPLOAD_PRE_SIGN_URL_PARAMS = {
    expiresInSeconds: 3600,
    maxSize: 100 * 1024 * 1024,
  };

  constructor(
    @Inject(S3_CLIENT_TOKEN)
    private readonly s3: NodeJsClient<S3>,
  ) {
    super();
  }

  override async startMultiPartUpload(
    bucket: string,
    file: Required<FileDefinition>,
    partSize: number = 10 * 1024 * 1024,
    folder?: string,
    options?: Partial<CreateMultipartUploadCommandInput>,
  ): Promise<StartMultipartUploadInfo> {
    const randomId = generateRandomId();
    const fullFilePath = this.generateFileKey(randomId, file, folder);

    const startedUpload = await this.s3.createMultipartUpload({
      ...options,
      Bucket: bucket,
      Key: fullFilePath,
    });

    // this not really possible, it's just bad typing in AWS SDK
    /* istanbul ignore next */
    if (startedUpload.UploadId === undefined)
      throw new Error(
        `Seems like upload started without any explicit error but UploadId is undefined. ${JSON.stringify(
          startedUpload,
        )}`,
      );

    const partNumbers = Math.ceil(file.fileSize / partSize);

    const signUrls = Array.from({ length: partNumbers }).map((_, i) => {
      const uploadCommand = new UploadPartCommand({
        Bucket: bucket,
        Key: fullFilePath,
        UploadId: startedUpload.UploadId,
        PartNumber: i + 1,
      });

      return getSignedUrl(this.s3, uploadCommand, {
        expiresIn: 3600,
      });
    });

    return {
      uploadId: startedUpload.UploadId,
      key: fullFilePath,
      bucket,
      partCount: partNumbers,
      uploadUrls: await Promise.all(signUrls),
    };
  }

  override async abortMultiPartUpload(
    uploadId: string,
    bucket: string,
    key: string,
    options?: Partial<AbortMultipartUploadCommandInput>,
  ): Promise<void> {
    await this.s3.abortMultipartUpload({
      ...options,
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    });
  }

  override async completeMultiPartUpload(
    uploadId: string,
    bucket: string,
    key: string,
    parts: CompletedPartDTO[],
    options?: Partial<CompleteMultipartUploadCommandInput>,
  ): Promise<void> {
    await this.s3.completeMultipartUpload({
      ...options,
      Bucket: bucket,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.eTag,
          PartNumber: part.partNumber,
        })),
      },
      Key: key,
      UploadId: uploadId,
    });
  }

  /**
   * @param options
   *   expiresInSeconds default value is 3600 seconds
   *   maxSize in bytes default value is 100MB
   * */
  override async generateUploadFilePreSignUrlPost(
    bucket: string,
    file: FileDefinition,
    folder?: string,
    options?: {
      expiresInSeconds?: number;
      fields?: Record<string, string>;
      maxSize?: number;
    },
  ): Promise<FileUploadPreSignUrlPostResult> {
    const opt = {
      ...this.DEFAULT_UPLOAD_PRE_SIGN_URL_PARAMS,
      ...options,
    };
    const randomId = generateRandomId();
    const fullFilePath = this.generateFileKey(randomId, file, folder);

    const postUrl = await createPresignedPost(this.s3, {
      Bucket: bucket,
      Expires: opt.expiresInSeconds,
      Fields: opt.fields,
      Conditions: [['content-length-range', 0, opt.maxSize]],
      Key: fullFilePath,
    });

    return {
      bucket,
      key: fullFilePath,
      url: postUrl.url,
      fields: postUrl.fields,
    };
  }

  override async generateDownloadFilePreSignUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });
  }

  override async generateUploadFilePreSignUrlPut(
    bucket: string,
    file: FileDefinition,
    folder?: string,
    expiresInSeconds?: number,
  ): Promise<FileUploadPreSignUrlPutResult> {
    const randomId = generateRandomId();
    const fullFilePath = this.generateFileKey(randomId, file, folder);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fullFilePath,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      bucket: bucket,
      key: fullFilePath,
      url: url,
    };
  }

  override async uploadFile(
    bucket: string,
    file: FileDefinition,
    body: NodeJsRuntimeStreamingBlobPayloadInputTypes,
    folder?: string,
    options?: PutObjectCommandInput,
  ): Promise<UploadedFileInfo> {
    const randomId = generateRandomId();
    const fullFilePath = this.generateFileKey(randomId, file, folder);

    await this.s3.putObject({
      ...options,
      Bucket: bucket,
      Key: fullFilePath,
      Body: body,
    });

    return {
      bucket,
      key: fullFilePath,
    };
  }

  override async downloadFile(bucket: string, key: string): Promise<string> {
    const object = await this.s3.getObject({
      Bucket: bucket,
      Key: key,
    });

    return consumers.text(object.Body!);
  }
}
