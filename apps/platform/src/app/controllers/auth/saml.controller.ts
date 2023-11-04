import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SamlService } from '../../services';
import { SkipAuth } from '@softkit/auth';
import { GenerateMetadataRequest } from './vo/saml.dto';
import { ClsService } from 'nestjs-cls';
import { ClsStore } from '../../common/vo/cls-store';

@ApiTags('Auth')
@Controller({
  path: 'auth/saml/sso',
  version: '1',
})
export class SamlController {
  constructor(
    private readonly clsStore: ClsService<ClsStore>,
    private readonly samlService: SamlService,
  ) {}

  @Get('metadata')
  @SkipAuth()
  public async samlMetadata(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query() request: GenerateMetadataRequest,
  ) {
    this.clsStore.set('tenantId', request.tenantId);
    const metadata = await this.samlService.generateMetadata(
      request.samlConfigurationId,
      req,
      res,
    );

    res.header('Content-Type', 'application/xml');
    res.send(metadata);
  }
}
