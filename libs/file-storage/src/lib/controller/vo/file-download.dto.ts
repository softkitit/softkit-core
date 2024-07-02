import { IsNotEmptyLocalized } from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';
import { string } from 'yargs';

export class FileDownloadRequest {
  @ApiProperty({
    required: true,
    type: string,
    description: 'File name in a storage',
  })
  @IsNotEmptyLocalized()
  key!: string;
}
