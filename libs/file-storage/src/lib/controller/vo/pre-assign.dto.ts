import { Expose } from 'class-transformer';
import {
  IsArrayCombinedLocalized,
  IsStringLocalized,
} from '@softkit/validation';

export class UploadPresignRequest {
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
