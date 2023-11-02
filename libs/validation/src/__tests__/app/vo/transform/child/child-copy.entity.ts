import { PickType } from '@nestjs/swagger';
import { BaseChildEntity } from './base-child.entity';

export class ChildCopyEntity extends PickType(BaseChildEntity, ['id']) {}
