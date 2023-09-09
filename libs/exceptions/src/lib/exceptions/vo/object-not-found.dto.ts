import { ApiProperty } from '@nestjs/swagger';

export class ObjectNotFoundData {
  @ApiProperty({
    description: 'name of the entity that was not found',
  })
  entityName!: string;
}
