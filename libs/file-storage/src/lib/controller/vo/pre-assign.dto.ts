import { Expose } from 'class-transformer';
import {
  IsArrayCombinedLocalized,
  IsStringLocalized,
} from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPresignRequest {
  @ApiProperty()
  @IsStringLocalized({
    each: true,
  })
  @IsArrayCombinedLocalized({
    minLength: 1,
    maxLength: 20,
  })
  originalFileNames!: string[];
}

export class PreSignedResponse {
  @Expose()
  key!: string;

  @Expose()
  preSignedUrl!: string;

  @Expose()
  originalFileName!: string;
}
