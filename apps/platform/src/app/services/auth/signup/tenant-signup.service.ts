import { Injectable, Logger } from '@nestjs/common';
import { AbstractSignupService } from './signup.service.interface';
import { SignUpByEmailWithTenantCreationRequest } from '../../../controllers/auth/vo/sign-up.dto';
import { ConflictEntityCreationException } from '@softkit/exceptions';
import { hashPassword } from '@softkit/crypto';
import { Transactional } from 'typeorm-transactional';
import AbstractAuthUserService from '../abstract-auth-user.service';
import { TenantService } from '../../tenants/tenant.service';
import { UserRoleService } from '../../roles/user-role.service';
import { UserTenantAccountService } from '../../users/user-tenant-account.service';
import { UserAccountStatus } from '../../../database/entities/users/types/user-account-status.enum';
import { AbstractTokenBuilderService } from '@softkit/auth';
import { UserProfile } from '../../../database/entities';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';
import { UserService } from '../../users/user.service';

@Injectable()
export class TenantSignupService extends AbstractSignupService<SignUpByEmailWithTenantCreationRequest> {
  private readonly logger = new Logger(TenantSignupService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly userAuthService: AbstractAuthUserService,
    private readonly userService: UserService,
    private readonly userTenantAccountService: UserTenantAccountService,
    private readonly roleService: UserRoleService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >,
  ) {
    super();
  }

  @Transactional()
  async signUp(createUserDto: SignUpByEmailWithTenantCreationRequest) {
    const existingUser = await this.userAuthService.findUserByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      this.logger.warn(
        `User trying to register with same email again: ${createUserDto.email}`,
        {
          userId: existingUser.id,
          ignore: true,
        },
      );

      throw new ConflictEntityCreationException(
        'User',
        'email',
        createUserDto.email,
      );
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const { user: userProfile, externalApproval } =
      await this.userAuthService.createUserByEmail({
        ...createUserDto,
        password: hashedPassword,
      });

    const tenant = await this.tenantService.setupTenant(
      createUserDto.companyName,
      createUserDto.companyIdentifier,
      userProfile,
    );

    const adminRole = await this.roleService.findDefaultAdminRole();

    this.logger.log(
      `Creating a new user, with email address: ${createUserDto.email}`,
    );

    await this.userTenantAccountService.createOrUpdateEntity({
      tenantId: tenant.id,
      userProfileId: userProfile.id,
      userProfile,
      roles: [adminRole],
      userStatus: UserAccountStatus.ACTIVE,
    });

    const userUpdated = await this.userService.findOne({
      relations: ['userTenantsAccounts', 'userTenantsAccounts.roles'],
      where: {
        id: userProfile.id,
      },
    });

    return {
      jwtPayload: this.tokenBuilderService.buildTokensPayload(userUpdated),
      approvalId: externalApproval.id,
    };
  }
}
