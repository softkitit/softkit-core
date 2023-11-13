import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { UserProfile, UserRole } from '../../database/entities';
import { ApprovalType } from '../../database/entities/users/types/approval-type.enum';
import { UserProfileStatus } from '../../database/entities/users/types/user-profile-status.enum';

import AbstractAuthUserService from '../auth/abstract-auth-user.service';
import { ExternalApprovalService } from './external-approval.service';
import { UserService } from './user.service';
import { generateRandomNumber } from '@softkit/crypto';
import { Maybe } from '@softkit/common-types';

import { BaseSignUpByEmailRequest } from '../../controllers/auth/vo/sign-up.dto';
import { UserTenantAccountService } from './user-tenant-account.service';
import { UserAccountStatus } from '../../database/entities/users/types/user-account-status.enum';
import { AbstractTokenBuilderService, JwtTokensPayload } from '@softkit/auth';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../common/vo/token-payload';

@Injectable()
export default class AuthUserService extends AbstractAuthUserService {
  private readonly logger = new Logger(AuthUserService.name);

  constructor(
    private readonly userService: UserService,
    private readonly userTenantAccount: UserTenantAccountService,
    private readonly externalApprovalService: ExternalApprovalService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >,
  ) {
    super();
  }

  @Transactional()
  override async createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: UserRole[],
    userProfileId?: string,
  ): Promise<JwtTokensPayload> {
    const userProfile = await (userProfileId
      ? this.userService.createOrUpdateEntity({
          status: UserProfileStatus.ACTIVE,
          email,
          firstName,
          lastName,
        })
      : this.userService.findOneById(userProfileId));

    await this.userTenantAccount.createOrUpdateEntity({
      tenantId,
      userProfileId: userProfile.id,
      userProfile,
      userStatus: UserAccountStatus.ACTIVE,
      roles,
    });

    return this.tokenBuilderService.buildTokensPayload(userProfile);
  }

  @Transactional()
  override async createUserByEmail(request: BaseSignUpByEmailRequest) {
    const user = await this.userService.createOrUpdateEntity({
      ...request,
      status: UserProfileStatus.WAITING_FOR_EMAIL_APPROVAL,
    });

    const externalApproval =
      await this.externalApprovalService.createOrUpdateEntity({
        userId: user.id,
        user,
        code: generateRandomNumber(6).toString(),
        approvalType: ApprovalType.REGISTRATION,
      });

    return {
      user,
      externalApproval,
    };
  }

  @Transactional()
  override async findUserByEmail(email: string): Promise<Maybe<UserProfile>> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      return undefined;
    }

    return user;
  }

  override async saveRefreshToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: string,
  ): Promise<void> {
    this.logger.error(`saveRefreshToken not implemented yet`);
  }

  @Transactional()
  override async approveSignUp(
    approveId: string,
    code: string,
  ): Promise<boolean> {
    // todo consider allowing limited amount of times to try to approve account (e.g. 3 times)
    //  than archive and send new email with new code to approve account
    const approvalEntity =
      await this.externalApprovalService.findOneById(approveId);

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
        UserProfileStatus.ACTIVE,
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
}
