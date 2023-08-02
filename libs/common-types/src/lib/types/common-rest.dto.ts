import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUIDLocalized,
  IsIntegerStringLocalized,
} from '@saas-buildkit/validation';

export class SimpleResponseForCreatedEntityWithMessage<ID> {
  @ApiProperty({
    description:
      'General friendly message that can be shown to the user, about entity creation',
  })
  message!: string;
  data!: {
    id: ID;
  };
}

export class IdParamUUID {
  @ApiProperty({
    description: 'Entity id, uuid v4 format',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUIDLocalized()
  id!: string;
}

export class VersionNumberParam {
  @ApiProperty({
    description: 'Version number of entity that you want to delete',
    example: '1',
    minimum: 0,
    required: true,
  })
  @IsIntegerStringLocalized({
    min: 0,
  })
  version!: number;
}

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
      "detail of the error, comprehensive message for the user (e.g. 'user with id 12344321 not found')",
  })
  detail!: string;

  @ApiProperty({
    description:
      'error instance, unique identifier for this particular occurrence of the problem',
  })
  instance!: string;
}
