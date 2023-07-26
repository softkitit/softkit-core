import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { SamlService } from '../../services';
import { SkipAuth } from "@saas-buildkit/auth";

@ApiTags('Auth')
@Controller({
  path: 'auth/saml/sso',
  version: '1',
})
export class SamlController {
  constructor(
    private readonly samlService: SamlService,
    private readonly i18: I18nService,
  ) {}

  @Get('metadata')
  @SkipAuth()
  public async samlMetadata(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const metadata = await this.samlService.generateMetadata(req, res);

    res.header('Content-Type', 'application/xml');
    res.send(metadata);
  }
}
