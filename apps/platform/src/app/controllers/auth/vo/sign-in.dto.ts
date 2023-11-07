import { PickType } from '@nestjs/swagger';
import { UserProfile } from '../../../database/entities';

export class SignInRequest extends PickType(UserProfile, [
  'email',
  'password',
]) {}
