import { ApiProperty } from '@nestjs/swagger';

export class SimpleResponseWithMessage {
  constructor(public message: string) {}
}

export interface SimpleResponseForCreatedEntityWithMessage<ID> {
  message: string;
  data: {
    id: ID;
  };
}

/**
 * following rfc
 * @link https://www.rfc-editor.org/rfc/rfc7807
 * */
export class ErrorResponse {
  @ApiProperty({
    description: 'link to the docs with more details about the error',
    required: true,
  })
  type!: string;

  @ApiProperty({
    description: 'title of the error, short description',
  })
  title!: string;

  @ApiProperty({
    description: 'http status code of the error, e.g. 404',
  })
  status!: number;

  @ApiProperty({
    description:
      "detail of the error, comprehensive message for the user (e.g. 'user with id 12344321 not found')",
  })
  detail!: string;

  @ApiProperty({
    description:
      'error instance, unique identifier for this particular occurrence of the problem',
  })
  instance!: string;
}
