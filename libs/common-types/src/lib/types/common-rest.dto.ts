import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUIDLocalized,
  IsIntegerStringCombinedLocalized,
  IsNotEmptyLocalized,
} from '@softkit/validation';

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
    description: 'Version number of entity',
    example: '1',
    minimum: 0,
    required: true,
  })
  @IsNotEmptyLocalized()
  @IsIntegerStringCombinedLocalized({
    min: 0,
  })
  version!: number;
}
