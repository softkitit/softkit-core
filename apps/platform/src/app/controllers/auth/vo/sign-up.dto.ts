import {
  IsEmailLocalized,
  IsStringCombinedLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '@softkit/validation';

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
  @IsStringCombinedLocalized()
  @PasswordLocalized()
  password!: string;

  /**
   * Repeat password
   * */
  @PasswordLocalized()
  @MatchesWithProperty(CreateUserRequest, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsStringCombinedLocalized()
  repeatedPassword!: string;

  @IsStringCombinedLocalized({ maxLength: 256 })
  firstName!: string;

  @IsStringCombinedLocalized({ maxLength: 256 })
  lastName!: string;

  @IsStringCombinedLocalized({ maxLength: 256 })
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
  @IsStringCombinedLocalized()
  @PasswordLocalized()
  password!: string;
}

export class ApproveSignUpRequest {
  @IsStringCombinedLocalized()
  // todo  uuid validation
  approvalId!: string;

  @IsStringCombinedLocalized({ minLength: 6, maxLength: 6 })
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
