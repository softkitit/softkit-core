import { IsNotEmpty } from 'class-validator';

export class FileDownloadRequest {
  @IsNotEmpty()
  key!: string;
}
