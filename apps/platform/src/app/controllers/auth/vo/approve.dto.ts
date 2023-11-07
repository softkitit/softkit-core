import { PickType } from '@nestjs/swagger';
import { ExternalApproval } from '../../../database/entities';

export class ApproveSignUpRequest extends PickType(ExternalApproval, [
  'id',
  'code',
]) {}
