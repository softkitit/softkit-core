import { Injectable, Logger } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { Profile } from 'passport-saml';
import { Transactional } from 'typeorm-transactional';
import { CreateUserRequest } from '../../controllers/auth/vo/sign-up.dto';
import { RoleType } from '../../database/entities/role/types/default-role.enum';
import { AuthType } from '../../database/entities/user/types/auth-type.enum';
import { UserStatus } from '../../database/entities/user/types/user-status.enum';
import { CustomUserRoleService } from '../roles/custom-user-role.service';

import { TenantService } from '../tenants/tenant.service';
import AbstractAuthUserService from './abstract-auth-user-service';
import { AppConfig } from "@saas-buildkit/bootstrap";
import { TokenService } from "@saas-buildkit/auth";
import { hashPassword, verifyPassword } from "@saas-buildkit/crypto";
import {
  FailedToCreateEntityException,
  GeneralForbiddenException, GeneralInternalServerException, GeneralNotFoundException,
  GeneralUnauthorizedException
} from "@saas-buildkit/exceptions";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public static readonly FIRST_NAME_SAML_ATTR: string = 'urn:oid:2.5.4.42';
  public static readonly LAST_NAME_SAML_ATTR: string = 'urn:oid:2.5.4.4';

  constructor(
    private readonly appConfig: AppConfig,
    private readonly tokenService: TokenService,
    private readonly tenantService: TenantService,
    private readonly userAuthService: AbstractAuthUserService,
    private readonly roleService: CustomUserRoleService,
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
      return this.tokenService.signTokens(
        this.userAuthService.toJwtPayload(user),
      );
    } else {
      const defaultRole = await this.roleService.findDefaultRole(tenantId);

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
        AuthType.SAML_TENANT,
        defaultRole,
      );

      return this.tokenService.signTokens(newUserPayload);
    }
  }

  @Transactional()
  async signUp(createUserDto: CreateUserRequest) {
    const user = await this.userAuthService.findUserByEmail(
      createUserDto.email,
    );

    // if user exists just return empty response to prevent exposing emails of registered users
    if (user) {
      this.logger.warn(
        `User trying to register with same email again: ${createUserDto.email}`,
        {
          userId: user,
        },
      );

      throw new FailedToCreateEntityException(
        'User',
        'email',
        createUserDto.email,
      );
    }

    const { tenant, defaultRoles } = await this.tenantService.setupTenant(
      createUserDto.companyName,
    );

    const hashedPassword = await hashPassword(createUserDto.password);

    this.logger.log(
      `Creating a new user, with email address: ${createUserDto.email}`,
    );

    const adminRole = defaultRoles.find(
      (role) => role.roleType === RoleType.ADMIN,
    );

    if (!adminRole) {
      /**
       *  this should never happen, but just in case we need to react and help
       *  most likely it's some basic configuration issue, or issue after refactoring
       */
      /* istanbul ignore next */
      this.logger.error(`
      Admin role not found for tenant ${tenant.id}.
      Usually that means that we have a problem with default roles setup.
      Check that we have default roles with type admin
      `);
      /* istanbul ignore next */
      throw new GeneralInternalServerException();
    }

    return this.userAuthService.createUserLocal(
      createUserDto.email,
      hashedPassword,
      createUserDto.firstName,
      createUserDto.lastName,
      tenant.id,
      adminRole,
    );
  }

  /**
   * we don't want to expose if user exists or not to prevent brute force attacks on emails of registered users
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
      user.status !== UserStatus.ACTIVE
    ) {
      throw new GeneralUnauthorizedException();
    }

    return this.tokenService.signTokens(
      this.userAuthService.toJwtPayload(user),
    );
  }

  @Transactional()
  async refreshTokens(userId: string) {
    const user = await this.userAuthService.findUserByEmail(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new GeneralUnauthorizedException();
    }

    return this.tokenService.signTokens(
      this.userAuthService.toJwtPayload(user),
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
