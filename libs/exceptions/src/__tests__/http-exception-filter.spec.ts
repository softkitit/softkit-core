import {
  Controller,
  ForbiddenException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import {
  AnyExceptionFilter,
  ErrorResponse,
  ConflictEntityCreationException,
  GeneralForbiddenException,
  GeneralInternalServerException,
  GeneralNotFoundException,
  GeneralUnauthorizedException,
  HttpExceptionFilter,
  MissingConfigurationForFeatureException,
  ObjectNotFoundException,
  OptimisticLockException,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
} from '../';
import { I18nJsonLoader, I18nModule } from '@saas-buildkit/nestjs-i18n';
import * as path from 'node:path';

describe('http exception filter e2e test', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          typesOutputPath: path.join(
            __dirname,
            '../lib/generated/i18n.generated.ts',
          ),
          loaders: [
            new I18nJsonLoader({
              path: path.join(__dirname, '../lib/i18n/'),
            }),
          ],
        }),
      ],
      controllers: [SimpleHttpExceptionController],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(
      new AnyExceptionFilter(httpAdapterHost),
      new HttpExceptionFilter(httpAdapterHost),
      new OverrideDefaultNotFoundFilter(httpAdapterHost),
      new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost),
    );

    await app.listen(0);
  });

  it('not found exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/not-found',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(errorBody.status).toBe(404);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Not Found');
    expect(errorBody.detail).toContain('not find');
    expect(errorBody.instance).toContain('req-');
  });

  it('default not found exception override filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/not-existing-in-any-controller',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(errorBody.status).toBe(404);
    expect(errorBody.type).toBeDefined();
    // specific error because i18n is not connected
    expect(errorBody.title).toBe('Not Found');
    expect(errorBody.detail).toContain('Can not find');
    expect(errorBody.instance).toContain('req-');
  });

  it('default forbidden exception override filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/default-forbidden-exception',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(403);
    expect(errorBody.status).toBe(403);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Access Denied');
    expect(errorBody.detail).toContain(
      "You don't have access to this resource. Please contact",
    );
    expect(errorBody.instance).toContain('req-');
  });

  it('general forbidden exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/general-forbidden',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(403);
    expect(errorBody.status).toBe(403);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Access Denied');
    expect(errorBody.detail).toContain(`You don't have access`);
    expect(errorBody.instance).toContain('req-');
  });

  it('general unauthorized exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/unauthorized',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(401);
    expect(errorBody.status).toBe(401);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Unauthorized');
    expect(errorBody.detail).toContain('you are not authorized');
    expect(errorBody.instance).toContain('req-');
  });

  it('general internal server error exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/custom-internal-server-error',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(500);
    expect(errorBody.status).toBe(500);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Internal Server Error');
    expect(errorBody.detail).toContain(
      'error occurred while processing your request',
    );
    expect(errorBody.instance).toContain('req-');
  });

  it('missing configuration for feature exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/missing-configuration-for-feature',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(errorBody.status).toBe(404);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Not Found');
    expect(errorBody.detail).toContain('Please contact your administrator');
    expect(errorBody.instance).toContain('req-');
  });

  it('object not found exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/object-not-found',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(errorBody.status).toBe(404);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Not Found');
    expect(errorBody.detail).toContain(
      "It doesn't exist anymore or you don't have access to it.",
    );
    expect(errorBody.instance).toContain('req-');
  });

  it('optimistic lock exception filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/optimistic-lock',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(409);
    expect(errorBody.status).toBe(409);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Conflict Error');
    expect(errorBody.detail).toContain('Can not save changes for');
    expect(errorBody.instance).toContain('req-');
  });

  it('unknown exception thrown filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/unknown-exception-thrown',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(500);
    expect(errorBody.status).toBe(500);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Internal Server Error');
    expect(errorBody.detail).toContain("You don't need to contact support");
    expect(errorBody.instance).toContain('req-');
  });

  it('failed to create entity filter test', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/failed-to-create-entity-thrown',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(errorBody.status).toBe(HttpStatus.CONFLICT);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Conflict Error');
    expect(errorBody.detail).toContain(
      'Can not create saml_configuration_idp_metadata',
    );
    expect(errorBody.instance).toContain('req-');
  });
});

@Controller({
  path: 'failing-http',
})
class SimpleHttpExceptionController {
  @Post('not-found')
  public async notFound() {
    throw new GeneralNotFoundException();
  }

  @Post('general-forbidden')
  public async generalForbidden() {
    throw new GeneralForbiddenException();
  }

  @Post('unauthorized')
  public async unauthorized() {
    throw new GeneralUnauthorizedException();
  }

  @Post('missing-configuration-for-feature')
  public async missingConfigurationForFeature() {
    throw new MissingConfigurationForFeatureException('SAML SSO');
  }

  @Post('object-not-found')
  public async objectNotFound() {
    throw new ObjectNotFoundException('saml_configuration');
  }

  @Post('optimistic-lock')
  public async optimisticLock() {
    throw new OptimisticLockException(2);
  }

  @Post('unknown-exception-thrown')
  public async unknownExceptionThrown() {
    throw new Error('unknown exception thrown');
  }

  @Post('unknown-exception-string-thrown')
  public async unknownExceptionStringThrown() {
    throw 'unknown exception thrown';
  }

  @Post('default-forbidden-exception')
  public async defaultForbiddenException() {
    throw new ForbiddenException();
  }

  @Post('custom-internal-server-error')
  public async customInternalServerError() {
    throw new GeneralInternalServerException();
  }

  @Post('failed-to-create-entity-thrown')
  public async failedToCreateEntityThrown() {
    throw new ConflictEntityCreationException(
      'saml_configuration_idp_metadata',
      'issuer',
      'https://idp.example.com/saml2',
    );
  }
}
