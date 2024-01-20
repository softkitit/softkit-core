import { IsIntegerLocalized, MinLocalized } from '@softkit/validation';
import { ApiProperty } from '@nestjs/swagger';

export class VersionedJobData {
  @ApiProperty({
    description: `Job version, is required to do a safe reschedule and change the data`,
  })
  @IsIntegerLocalized()
  @MinLocalized(0)
  jobVersion!: number;
}
