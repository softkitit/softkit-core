import { IsNotEmptyLocalized } from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';

export class FileDownloadRequest {
  @ApiProperty({
    required: true,
    type: String,
    description: 'File name in a storage',
  })
  @IsNotEmptyLocalized()
  key!: string;
}
