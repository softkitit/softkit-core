import { Injectable, Logger } from '@nestjs/common';
import { AbstractSignupService } from './signup.service.interface';
import {
  BaseSignUpByEmailRequest,
  SignUpByEmailResponse,
} from '../../../controllers/auth/vo/sign-up.dto';
import { ConflictEntityCreationException } from '@softkit/exceptions';
import { hashPassword } from '@softkit/crypto';
import { Transactional } from 'typeorm-transactional';
import AbstractAuthUserService from '../abstract-auth-user.service';
import { AbstractTokenBuilderService } from '@softkit/auth';
import { UserProfile } from '../../../database/entities';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';

@Injectable()
export class SignupService extends AbstractSignupService<BaseSignUpByEmailRequest> {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    private readonly userAuthService: AbstractAuthUserService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >,
  ) {
    super();
  }

  @Transactional()
  async signUp(
    createUserDto: BaseSignUpByEmailRequest,
  ): Promise<SignUpByEmailResponse> {
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

    this.logger.log(
      `Creating a new user, with email address: ${createUserDto.email}`,
    );

    const { user, externalApproval } =
      await this.userAuthService.createUserByEmail({
        ...createUserDto,
        password: hashedPassword,
      });

    return {
      approvalId: externalApproval.id,
      jwtPayload: this.tokenBuilderService.buildTokensPayload(user),
    };
  }
}
