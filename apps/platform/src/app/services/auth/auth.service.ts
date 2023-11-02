import { Injectable, Logger } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { Profile } from 'passport-saml';
import { Transactional } from 'typeorm-transactional';
import { UserRoleService } from '../roles/user-role.service';

import AbstractAuthUserService from './abstract-auth-user.service';
import { AbstractTokenBuilderService, TokenService } from '@softkit/auth';
import { verifyPassword } from '@softkit/crypto';
import {
  GeneralForbiddenException,
  GeneralInternalServerException,
  GeneralNotFoundException,
  GeneralUnauthorizedException,
} from '@softkit/exceptions';
import { UserProfileStatus } from '../../database/entities/users/types/user-profile-status.enum';
import { UserProfile } from '../../database/entities';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../common/vo/token-payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public static readonly FIRST_NAME_SAML_ATTR: string = 'urn:oid:2.5.4.42';
  public static readonly LAST_NAME_SAML_ATTR: string = 'urn:oid:2.5.4.4';

  constructor(
    private readonly tokenService: TokenService,
    private readonly userAuthService: AbstractAuthUserService,
    private readonly roleService: UserRoleService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >,
  ) {}

  /**
   * @throws {GeneralNotFoundException} if we can't approve the user email
   * (e.g. wrong code, user already approved, etc.)
   * */
  @Transactional()
  async approveUserEmail(approveId: string, code: string) {
    const approved = await this.userAuthService.approveSignUp(approveId, code);

    if (!approved) {
      throw new GeneralNotFoundException();
    }
  }

  @Transactional()
  async signInSaml(tenantId: string, profile: Profile) {
    if (!isEmail(profile.email) || !profile.email) {
      this.logger.error(
        `User trying to login with SAML, but email is undefined.
        ${profile}. This looks like a client configuration issue we need to react and help.`,
      );
      throw new GeneralForbiddenException();
    }

    const user = await this.userAuthService.findUserByEmail(profile.email);

    if (user) {
      const payload = this.tokenBuilderService.buildTokensPayload(user);
      return this.tokenService.signTokens(payload);
    } else {
      const defaultRole = await this.roleService.findDefaultUserRole();

      if (!defaultRole) {
        /**
         *  this should never happen, but just in case we need to react and help
         *  most likely it's some basic configuration issue, or issue after refactoring
         */
        /* istanbul ignore next */
        this.logger.error(
          `User trying to login with SAML, but default role is not set for tenant: ${tenantId}.
          This looks like a client configuration issue we need to react and help.`,
        );
        /* istanbul ignore next */
        throw new GeneralInternalServerException();
      }

      const newUserPayload = await this.userAuthService.createSsoUser(
        tenantId,
        profile.email.trim().toLowerCase(),
        this.getSamlAttribute(profile, AuthService.FIRST_NAME_SAML_ATTR),
        this.getSamlAttribute(profile, AuthService.LAST_NAME_SAML_ATTR),
        [defaultRole],
      );

      return this.tokenService.signTokens(newUserPayload);
    }
  }

  /**
   * we don't wa nt to expose if user exists or not to prevent brute force attacks on emails of registered users
   * we just return Not Found
   * @throws {GeneralUnauthorizedException} if user not found or password is incorrect
   * */
  @Transactional()
  async signIn(email: string, password: string) {
    const user = await this.userAuthService.findUserByEmail(email);

    if (
      !user ||
      user.password === undefined ||
      !(await verifyPassword(password, user.password)) ||
      user.status !== UserProfileStatus.ACTIVE
    ) {
      throw new GeneralUnauthorizedException();
    }

    const payload = this.tokenBuilderService.buildTokensPayload(user);
    return this.tokenService.signTokens(payload);
  }

  @Transactional()
  async refreshAccessToken(userId: string) {
    const user = await this.userAuthService.findUserByEmail(userId);

    if (!user || user.status !== UserProfileStatus.ACTIVE) {
      throw new GeneralUnauthorizedException();
    }

    return this.tokenService.signAccessToken(
      this.tokenBuilderService.buildAccessTokenPayload(user),
    );
  }

  private getSamlAttribute(profile: Profile, attribute: string): string {
    // eslint-disable-next-line security/detect-object-injection
    const attr = profile[attribute];

    if (!attr) {
      this.logger.error(
        `This is required attention. Attribute ${attribute} is not present in SAML response. Saml profile: ${JSON.stringify(
          profile,
        )}`,
      );
      return 'unknown';
    }

    return attr.toString();
  }
}
