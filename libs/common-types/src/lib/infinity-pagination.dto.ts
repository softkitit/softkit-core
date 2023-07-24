import { ApiProperty } from '@nestjs/swagger';

export class InfinityPaginationResultType<T> {
  @ApiProperty({ isArray: true, required: true })
  data!: T[];

  @ApiProperty({
    description: 'Showing is there next page or not',
    required: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    required: true,
    description: 'Showing count of available entities',
  })
  count!: number;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
}
