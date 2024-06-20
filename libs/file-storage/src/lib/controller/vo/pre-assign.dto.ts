import { ArrayMinSize, IsArray, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class PreAssignRequest {
  @IsArray()
  @IsString({
    each: true,
  })
  @ArrayMinSize(1)
  originalFileNames!: string[];
}

export class PreAssignResponse {
  @Expose()
  fileName!: string;

  @Expose()
  preAssignUrl!: string;
}
