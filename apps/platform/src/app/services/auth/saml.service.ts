import { Injectable, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RequestWithUser } from 'passport-saml/lib/passport-saml/types';
import { Transactional } from 'typeorm-transactional';

import AbstractAuthUserService from './abstract-auth-user-service';
import { AuthService } from './auth.service';
import { SamlStrategy } from './strategy/saml-strategy';
import { SamlConfig } from '../../config/saml.config';
import { MissingConfigurationForFeatureException } from '@softkit/exceptions';

@Injectable()
export class SamlService {
  private readonly logger = new Logger(SamlService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly samlConfig: SamlConfig,
    private readonly userService: AbstractAuthUserService,
  ) {}

  @Transactional()
  async login(
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>,
  ) {
    const strategy = await this.createStrategyByTenantUrl(req, res, replyData);

    await strategy.authenticate(req as unknown as RequestWithUser, {
      samlFallback: 'login-request',
    });
  }

  /**
   * generate saml xml metadata for a tenant url
   * */
  @Transactional()
  async generateMetadata(request: FastifyRequest, res: FastifyReply) {
    const strategy = await this.createStrategyByTenantUrl(request, res);

    // eslint-disable-next-line unicorn/no-null
    return strategy.generateServiceProviderMetadata(null, null);
  }

  private async createStrategyByTenantUrl(
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>,
  ) {
    const config = await this.userService.findSamlConfig(req.hostname);

    if (!config) {
      this.logger.warn(
        `User trying to login with SAML, but tenant config is not found. ${req.hostname}`,
      );
      throw new MissingConfigurationForFeatureException('SAML SSO');
    }

    return new SamlStrategy(
      this.authService,
      this.samlConfig,
      req,
      res,
      config.entryPoint,
      config.certificate,
      replyData,
    );
  }
}
