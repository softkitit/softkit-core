import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import {
  AnyExceptionFilter,
  ErrorResponse,
  GeneralBadRequestException,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
} from '../';
import { AppModule } from './app/app.module';
import { I18nValidationExceptionFilter } from '@saas-buildkit/nestjs-i18n';

describe('http exception filter', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    const httpAdapterHost = app.get(HttpAdapterHost);

    app.useGlobalFilters(
      new AnyExceptionFilter(httpAdapterHost),
      new HttpExceptionFilter(httpAdapterHost),
      new OverrideDefaultNotFoundFilter(httpAdapterHost),
      new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost),
      new I18nValidationExceptionFilter({
        detailedErrors: true,
      }),
    );

    await app.listen(0);
  });

  it('not found exception filter', async () => {
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

  it('default not found exception override filter', async () => {
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

  it('default forbidden exception override filter', async () => {
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

  it('general forbidden exception filter', async () => {
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

  it('general unauthorized exception filter', async () => {
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

  it('general internal server error exception filter', async () => {
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

  it('missing configuration for feature exception filter', async () => {
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

  it('object not found exception filter', async () => {
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

  it('optimistic lock exception filter', async () => {
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

  it('unknown exception thrown filter', async () => {
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

  it('failed to create entity filter', async () => {
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

  it('service unavailable', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/service-unavailable',
    });

    const errorBody = JSON.parse(response.body) as ErrorResponse;

    expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(errorBody.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(errorBody.type).toBeDefined();
    expect(errorBody.title).toBe('Service Unavailable');
    expect(errorBody.detail).toContain(
      'The service is currently unavailable. We aware of the problem and are working to resolve it as soon as possible.',
    );
    expect(errorBody.instance).toContain('req-');
  });

  it('bad request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/bad-request',
    });

    const errorBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(errorBody.message).toBe('Bad Request');
    expect(errorBody.errors.length).toBe(1);

    const generalBadRequestException = new GeneralBadRequestException(
      errorBody.errors[0],
    );

    const errorResponse = generalBadRequestException.toErrorResponse();

    expect(errorResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(errorResponse.type).toBeDefined();
    expect(errorResponse.title).toBe('exception.BAD_REQUEST.TITLE');
    expect(errorResponse.detail).toContain(
      'exception.BAD_REQUEST.GENERAL_DETAIL',
    );
  });

  it('healthcheck', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/failing-http/healthcheck',
    });

    const errorBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(errorBody.message).toBe('Service Unavailable');
  });
});
