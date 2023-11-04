import { Injectable, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RequestWithUser } from 'passport-saml/lib/passport-saml/types';
import { Transactional } from 'typeorm-transactional';

import { AuthService } from './auth.service';
import { SamlStrategy } from './strategy/saml-strategy';
import { SamlConfig } from '../../config/saml.config';
import { MissingConfigurationForFeatureException } from '@softkit/exceptions';
import { InitiateSamlLoginRequest } from '../../controllers/auth/vo/saml.dto';
import { SamlConfigurationService } from '../tenants/saml-configuration.service';

@Injectable()
export class SamlService {
  private readonly logger = new Logger(SamlService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly samlConfig: SamlConfig,
    private readonly samlConfigService: SamlConfigurationService,
  ) {}

  @Transactional()
  async login(
    request: InitiateSamlLoginRequest,
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>,
  ) {
    const strategy = await this.createStrategy(
      request.samlConfigurationId,
      req,
      res,
      replyData,
    );

    await strategy.authenticate(req as unknown as RequestWithUser, {
      samlFallback: 'login-request',
    });
  }

  /**
   * generate saml xml metadata for a tenant url
   * */
  @Transactional()
  async generateMetadata(
    samlConfigurationId: string,
    request: FastifyRequest,
    res: FastifyReply,
  ) {
    const samlConfig =
      await this.samlConfigService.findOneById(samlConfigurationId);
    const mockStrategy = new SamlStrategy(
      this.authService,
      this.samlConfig,
      request,
      res,
      samlConfig.entryPoint,
      samlConfig.certificate,
      {},
    );

    // eslint-disable-next-line unicorn/no-null
    return mockStrategy.generateServiceProviderMetadata(null, null);
  }

  private async createStrategy(
    samlConfigId: string,
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>,
  ) {
    const config = await this.samlConfigService.findOneById(samlConfigId);

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
