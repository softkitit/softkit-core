import { IsNotEmptyLocalized } from '@softkit/validation';

export class FileDownloadRequest {
  @IsNotEmptyLocalized()
  key!: string;
}
