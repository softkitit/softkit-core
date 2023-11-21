import { IsStringCombinedLocalized, MinLocalized } from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompletedPartDTO {
  @ApiProperty({
    description: 'ETag of the completed part',
    required: true,
  })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
  })
  eTag!: string;

  @ApiProperty({
    description: 'Part number of the completed part',
    minimum: 1,
    required: true,
  })
  @Expose()
  @MinLocalized(1)
  partNumber!: number;
}
