import {
  ExternalApproval,
  UserProfile,
  UserRole,
} from '../../database/entities';
import { Maybe } from '@softkit/common-types';
import { BaseSignUpByEmailRequest } from '../../controllers/auth/vo/sign-up.dto';
import { JwtTokensPayload } from '@softkit/auth';

export default abstract class AbstractAuthUserService {
  public abstract findUserByEmail(email: string): Promise<Maybe<UserProfile>>;

  public abstract createUserByEmail(
    signUpByEmailRequest: BaseSignUpByEmailRequest,
  ): Promise<{
    user: UserProfile;
    externalApproval: ExternalApproval;
  }>;

  /**
   * create user from SSO
   * @return jwtPayload
   * */
  public abstract createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: UserRole[],
    userProfileId?: string,
  ): Promise<JwtTokensPayload>;

  public abstract saveRefreshToken(
    userId: string,
    token: string,
  ): Promise<void>;

  public abstract approveSignUp(
    approveId: string,
    code: string,
  ): Promise<boolean>;
}
