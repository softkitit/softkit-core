import { ApiProperty } from '@nestjs/swagger';

export class ConflictEntityCreationData {
  @ApiProperty({
    description: 'name of the entity that was not found',
  })
  entityName!: string;

  @ApiProperty({
    description: 'name of the field that caused the conflict',
  })
  fieldName!: string;

  @ApiProperty({
    description: 'value of the field that caused the conflict',
  })
  fieldValue!: unknown;
}
