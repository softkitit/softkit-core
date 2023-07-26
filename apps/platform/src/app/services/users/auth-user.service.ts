import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CustomUserRole, User } from '../../database/entities';
import { ApprovalType } from '../../database/entities/user/types/approval-type.enum';
import { AuthType } from '../../database/entities/user/types/auth-type.enum';
import { UserStatus } from '../../database/entities/user/types/user-status.enum';

import AbstractAuthUserService from '../auth/abstract-auth-user-service';
import { SamlConfigurationService } from '../tenants/saml-configuration.service';
import { ExternalApprovalService } from './external-approval.service';
import { UserService } from './user.service';
import { JwtPayload } from "@saas-buildkit/auth";
import { generateRandomNumber } from "@saas-buildkit/crypto";
import { Maybe } from "@saas-buildkit/common-types";

@Injectable()
export default class AuthUserService extends AbstractAuthUserService {
  private readonly logger = new Logger(AuthUserService.name);

  constructor(
    private readonly userService: UserService,
    private readonly externalApprovalService: ExternalApprovalService,
    private readonly samlConfigService: SamlConfigurationService,
  ) {
    super();
  }

  @Transactional()
  override async createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    authType: AuthType,
    role: CustomUserRole,
  ): Promise<JwtPayload> {
    const user = await this.userService.createOrUpdateEntity({
      status: UserStatus.ACTIVE,
      email,
      authType,
      tenantId,
      firstName,
      lastName,
      roles: [role],
      //   cast here needed because it's the exclusive place for user creation without tenant id
      //   probably we will have more places like this in the future
      //   then we should consider to move this logic to the base service
    } as User);

    return this.toJwtPayload(user);
  }

  @Transactional()
  override async createUserLocal(
    email: string,
    hashedPassword: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    role: CustomUserRole,
  ) {
    const user = await this.userService.createOrUpdateEntity({
      status: UserStatus.WAITING_FOR_EMAIL_APPROVAL,
      email,
      password: hashedPassword,
      authType: AuthType.LOCAL,
      firstName,
      lastName,
      tenantId,
      // first created user is always an admin
      roles: [role],
    } as User);

    const externalApproval =
      await this.externalApprovalService.createOrUpdateEntity({
        userId: user.id,
        code: generateRandomNumber(6).toString(),
        approvalType: ApprovalType.REGISTRATION,
      });

    // todo send email here

    return {
      payload: this.toJwtPayload(user),
      approvalId: externalApproval.id,
    };
  }

  @Transactional()
  override async findPayloadByEmail(tenantId: string, email: string) {
    const user = await this.userService.findOneByEmailWithRoles(
      email,
      tenantId,
    );
    return user === undefined ? undefined : this.toJwtPayload(user);
  }

  @Transactional()
  override async findUserByEmail(email: string): Promise<Maybe<User>> {
    const user = await this.userService.findOneByEmailWithRoles(email);

    if (!user) {
      return undefined;
    }

    return user;
  }

  override async saveRefreshToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ): Promise<void> {
    // todo implement
    this.logger.log(`saveRefreshToken not implemented yet`);
  }

  @Transactional()
  override async findSamlConfig(
    tenantUrl: string,
  ): Promise<{ entryPoint: string; certificate: string } | undefined> {
    return this.samlConfigService.findSamlConfig(tenantUrl);
  }

  @Transactional()
  override async approveSignUp(
    approveId: string,
    code: string,
  ): Promise<boolean> {
    // todo consider allowing limited amount of times to try to approve account (e.g. 3 times)
    //  than archive and send new email with new code to approve account
    const approvalEntity = await this.externalApprovalService.findOneById(
      approveId,
    );

    if (!approvalEntity) {
      this.logger.log(
        `approvalEntity not found for id ${approveId}, code ${code}`,
        { securityConcern: true },
      );
      throw false;
    }

    if (approvalEntity.code === code) {
      await this.userService.updateUserStatus(
        approvalEntity.userId,
        UserStatus.ACTIVE,
      );

      return this.externalApprovalService.archive(
        approveId,
        approvalEntity.version,
      );
    } else {
      this.logger.log(`code ${code} is not valid, probably user typo`);
      return false;
    }
  }

  override toJwtPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      // todo implement mapping
      permissions: [],
      tenantId: user.tenantId,
    };
  }
}
