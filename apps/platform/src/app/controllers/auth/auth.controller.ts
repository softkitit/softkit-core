import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18n, I18nContext, I18nService } from '@saas-buildkit/nestjs-i18n';
import { AuthService, SamlService } from '../../services';

import {
  ApproveSignUpRequest,
  CreateUserRequest,
  SignInRequest,
} from './vo/sign-up.dto';
import { SkipAuth } from '@saas-buildkit/auth';
import {
  ApiConflictResponsePaginated,
  SimpleResponseForCreatedEntityWithMessage,
} from '@saas-buildkit/common-types';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
@SkipAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly samlService: SamlService,
    private readonly i18: I18nService,
  ) {}

  @Post('signup')
  @ApiConflictResponsePaginated(
    'Appears when user with such email already exists',
  )
  @HttpCode(HttpStatus.CREATED)
  public async signUp(
    @I18n() i18n: I18nContext,
    @Body() request: CreateUserRequest,
  ): Promise<SimpleResponseForCreatedEntityWithMessage<string>> {
    // depends on chosen workflow you can respond with tokens here and let user in
    const response = await this.authService.signUp(request);

    return {
      message: this.i18.t('user.FINISHED_REGISTRATION'),
      data: {
        id: response.approvalId,
      },
    };
  }

  @Post('approve-signup')
  @HttpCode(HttpStatus.OK)
  public async approveSignup(
    @I18n() i18n: I18nContext,
    @Body() request: ApproveSignUpRequest,
  ) {
    // depends on chosen workflow you can respond with tokens here and let user in
    await this.authService.approveUserEmail(request.approvalId, request.code);

    return {
      message: this.i18.t('user.SUCCESSFULLY_APPROVED_EMAIL'),
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  public async signIn(
    @I18n() i18n: I18nContext,
    @Body() request: SignInRequest,
  ) {
    const tokens = await this.authService.signIn(
      request.email,
      request.password,
    );

    return {
      message: this.i18.t('user.SUCCESSFULLY_LOGGED_IN'),
      data: tokens,
    };
  }

  @Get('sso/saml/login')
  @HttpCode(HttpStatus.OK)
  async samlLogin(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query('redirectUrl') redirectUrl: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.samlService.login(req, res, { redirectUrl, tenantId });
  }

  @Post('sso/saml/ac')
  @HttpCode(HttpStatus.OK)
  async samlAcknowledge(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    return this.samlService.login(req, res);
  }
}
