import { Expose } from 'class-transformer';
import {
  IsArrayCombinedLocalized,
  IsStringLocalized,
} from '@softkit/validation';

export class UploadPreAssignRequest {
  @IsStringLocalized({
    each: true,
  })
  @IsArrayCombinedLocalized({
    minLength: 1,
    maxLength: 20,
  })
  originalFileNames!: string[];
}

export class PreAssignResponse {
  @Expose()
  key!: string;

  @Expose()
  preAssignUrl!: string;

  @Expose()
  originalFileName!: string;
}
