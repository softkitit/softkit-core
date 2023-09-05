import { CustomUserRole, User } from '../../database/entities';
import { AuthType } from '../../database/entities/users/types/auth-type.enum';
import { Maybe } from '@softkit/common-types';
import { JwtPayload } from '@softkit/auth';

export default abstract class AbstractAuthUserService {
  public abstract findUserByEmail(email: string): Promise<Maybe<User>>;

  /**
   * @return created user id
   * */
  public abstract createUserLocal(
    email: string,
    hashedPassword: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    role: CustomUserRole,
  ): Promise<{
    payload: JwtPayload;
    approvalId: string;
  }>;

  /**
   * @return create user sso
   * */
  public abstract createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    authType: AuthType,
    role: CustomUserRole,
  ): Promise<JwtPayload>;

  public abstract saveRefreshToken(
    userId: string,
    token: string,
  ): Promise<void>;

  public abstract findPayloadByEmail(
    tenantId: string,
    email: string,
  ): Promise<Maybe<JwtPayload>>;

  public abstract findSamlConfig(tenantUrl: string): Promise<
    | {
        entryPoint: string;
        certificate: string;
      }
    | undefined
  >;

  public abstract approveSignUp(
    approveId: string,
    code: string,
  ): Promise<boolean>;

  public abstract toJwtPayload(user: User): JwtPayload;
}
