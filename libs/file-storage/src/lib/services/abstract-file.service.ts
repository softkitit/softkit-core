import {
  FileDefinition,
  FileUploadPreSignUrlPostResult,
  FileUploadPreSignUrlPutResult,
  StartMultipartUploadInfo,
  UploadedFileInfo,
} from './vo/file-definition';
import { CompletedPartDTO } from '../controller/vo/completed-part.dto';
import { Readable } from 'node:stream';

export abstract class AbstractFileService {
  protected DEFAULT_FILE_NAME_FULL_LENGTH = 64;

  abstract startMultiPartUpload(
    bucket: string,
    file: Required<FileDefinition>,
    partSize?: number,
    folder?: string,
  ): Promise<StartMultipartUploadInfo>;

  abstract abortMultiPartUpload(
    uploadId: string,
    bucket: string,
    key: string,
  ): Promise<void>;

  abstract completeMultiPartUpload(
    uploadId: string,
    bucket: string,
    key: string,
    parts: CompletedPartDTO[],
  ): Promise<void>;

  abstract generateUploadFilePreSignUrlPost(
    bucket: string,
    file: FileDefinition,
    folder?: string,
    options?: {
      expiresInSeconds?: number;
      fields?: Record<string, string>;
      maxSize?: number;
    },
  ): Promise<FileUploadPreSignUrlPostResult>;

  abstract generateUploadFilePreSignUrlPut(
    bucket: string,
    file: FileDefinition,
    folder?: string,
    expiresInSeconds?: number,
  ): Promise<FileUploadPreSignUrlPutResult>;

  abstract generateDownloadFilePreSignUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  abstract uploadFile(
    bucket: string,
    file: FileDefinition,
    body: string | Uint8Array | Buffer | Readable,
    folder?: string,
  ): Promise<UploadedFileInfo>;

  abstract downloadFile(bucket: string, key: string): Promise<string>;

  // todo implement
  // abstract streamFile(bucket: string, file: FileDefinition): Promise<string>;
  // abstract downloadStream(bucket: string, file: FileDefinition): Promise<string>;

  protected generateFileKey(
    uniqueFileNameWithoutExtension: string,
    file: FileDefinition,
    folder?: string,
  ): string {
    const originalFileName = this.truncateFileName(
      file.originalFileName,
      this.DEFAULT_FILE_NAME_FULL_LENGTH,
    );

    return [
      folder,
      `${uniqueFileNameWithoutExtension}-${originalFileName.toLowerCase()}`,
    ]
      .filter((a) => !!a)
      .join('/');
  }

  protected truncateFileName(fileName: string, maxLength: number): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // If there's no extension, truncate the whole name
      return fileName.slice(0, maxLength);
    }

    const extension = fileName.slice(lastDotIndex + 1);
    const nameWithoutExtension = fileName.slice(0, lastDotIndex);
    const truncatedName = nameWithoutExtension.slice(
      0,
      maxLength - extension.length - 1,
    );

    return truncatedName + '.' + extension;
  }
}
