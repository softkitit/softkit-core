import { Expose, Type } from 'class-transformer';
import {
  IsArrayCombinedLocalized,
  IsNotEmptyLocalized,
  IsStringLocalized,
} from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';

export class FileDataRequest {
  @ApiProperty({
    required: true,
    type: String,
    description: 'Original file name',
  })
  @IsNotEmptyLocalized()
  @IsStringLocalized()
  originalFileName!: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Folder for a file',
  })
  @IsStringLocalized()
  folder?: string;
}

export class UploadPresignRequest {
  @ApiProperty({
    isArray: true,
    type: FileDataRequest,
    description: 'File Data Request',
    required: true,
  })
  @IsArrayCombinedLocalized({
    minLength: 1,
    maxLength: 20,
  })
  @Type(() => FileDataRequest)
  filesData!: FileDataRequest[];
}

export class PreSignedResponse {
  @ApiProperty({
    required: true,
    type: String,
    description: 'File name in a storage',
  })
  @Expose()
  key!: string;

  @ApiProperty({
    required: true,
    type: String,
    description: 'Url for uploading files',
  })
  @Expose()
  preSignedUrl!: string;

  @ApiProperty({
    required: true,
    type: String,
    description: 'Original file name',
  })
  @Expose()
  originalFileName!: string;
}
