export interface FileDefinition {
  originalFileName: string;
  fileSize?: number;
}

export interface UploadedFileInfo {
  bucket: string;
  key: string;
}

export interface FileUploadPreSignUrlPostResult extends UploadedFileInfo {
  url: string;
  fields: Record<string, string>;
}

export interface FileUploadPreSignUrlPutResult extends UploadedFileInfo {
  url: string;
}

export interface StartMultipartUploadInfo extends UploadedFileInfo {
  uploadId: string;
  partCount: number;
  uploadUrls: string[];
}
