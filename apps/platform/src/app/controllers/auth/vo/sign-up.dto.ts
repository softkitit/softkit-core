import {
  IsStringCombinedLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '@softkit/validation';
import { OmitType } from '@nestjs/swagger';
import { UserProfile } from '../../../database/entities';
import { JwtTokensPayload } from '@softkit/auth';
import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@softkit/typeorm';

export class BaseSignUpByEmailRequest extends OmitType(UserProfile, [
  ...DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  'id',
  'status',
  'userTenantsAccounts',
] as const) {
  /**
   * @description Repeat password, it's good to do validation both on backend and frontend,
   * just in case of some issues with frontend,
   * we won't save garbage to the database
   * */
  @PasswordLocalized()
  @MatchesWithProperty(BaseSignUpByEmailRequest, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsStringCombinedLocalized()
  repeatedPassword!: string;
}

export class SignUpByEmailWithTenantCreationRequest extends BaseSignUpByEmailRequest {
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  companyName!: string;

  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  companyIdentifier!: string;
}

export class SignUpByEmailRequest extends BaseSignUpByEmailRequest {}

export class SignUpByEmailResponse {
  /**
   * id of approval entity, for future reuse
   * */
  approvalId!: string;
  /**
   * payloads for token generation, useful in case if we want user in without verification
   * */
  jwtPayload!: JwtTokensPayload;
}
