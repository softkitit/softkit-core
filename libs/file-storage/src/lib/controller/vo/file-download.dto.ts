import { IsNotEmptyLocalized } from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';

export class FileDownloadRequest {
  @ApiProperty()
  @IsNotEmptyLocalized()
  key!: string;
}
