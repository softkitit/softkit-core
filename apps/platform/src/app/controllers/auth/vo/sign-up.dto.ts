import {
  IsEmailLocalized,
  IsRequiredStringLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '@saas-buildkit/validation';

export class CreateUserRequest {
  /**
   * User email address
   * @example john.doe@gmail.com
   * */
  @IsEmailLocalized()
  email!: string;

  /**
   * Original password
   * */
  @IsRequiredStringLocalized()
  @PasswordLocalized()
  password!: string;

  /**
   * Repeat password
   * */
  @PasswordLocalized()
  @MatchesWithProperty(CreateUserRequest, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsRequiredStringLocalized()
  repeatedPassword!: string;

  @IsRequiredStringLocalized({ maxLength: 256 })
  firstName!: string;

  @IsRequiredStringLocalized({ maxLength: 256 })
  lastName!: string;

  @IsRequiredStringLocalized({ maxLength: 256 })
  companyName!: string;
}

export class SignInRequest {
  /**
   * User email address
   * @example john.doe@gmail.com
   * */
  @IsEmailLocalized()
  email!: string;

  /**
   * @example absD123k&
   * */
  @IsRequiredStringLocalized()
  @PasswordLocalized()
  password!: string;
}

export class ApproveSignUpRequest {
  @IsRequiredStringLocalized()
  // todo uuid validation
  approvalId!: string;

  @IsRequiredStringLocalized({ minLength: 6, maxLength: 6 })
  code!: string;
}

export class UserTokens {
  /**
   * Access Token, should be used with each request. It lives for short period of time.
   * */
  accessToken!: string;

  /**
   * Refresh Token, should be used for refreshing the access token
   * */
  refreshToken!: string;
}
