import { ApiProperty } from '@nestjs/swagger';

/**
 * @description The error response following rfc7807
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
      "detail of the error, comprehensive message for the end user (e.g. 'customer with id 12344321 not found')",
  })
  detail!: string;

  @ApiProperty({
    description:
      'additional data that can be used by the client to handle the error',
  })
  data?: object;

  @ApiProperty({
    description:
      'error instance, unique identifier for this particular occurrence of the problem',
  })
  instance!: string;
}
