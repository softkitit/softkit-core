import { ApiProperty } from '@nestjs/swagger';

/**
 * This class is useful only for API documentation purposes.
 * */
/* istanbul ignore next */
export class BadRequestData {
  @ApiProperty({
    description: 'property key that caused the error',
  })
  property!: string;

  @ApiProperty({
    isArray: true,
    type: BadRequestData,
    description: 'embedded errors in case if object is nested',
  })
  children: BadRequestData[] = [];

  @ApiProperty({
    type: 'object',
    description: 'constrains that caused the error',
  })
  constraints!: Record<string, string>;
}
