import { ApiProperty } from '@nestjs/swagger';

export class OptimisticLockData {
  @ApiProperty({
    description: 'The current version of the entity',
  })
  currentVersion!: number;
}
