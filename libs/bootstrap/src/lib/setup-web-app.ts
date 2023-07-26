import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TestingModule } from '@nestjs/testing/testing-module';
import { useContainer } from 'class-validator';
import { FastifyInstance } from 'fastify/types/instance';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
import { REQUEST_ID_HEADER } from './vo/constants';
import { generateRandomId } from '@saas-buildkit/crypto';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
} from '@saas-buildkit/exceptions';
import { DEFAULT_VALIDATION_OPTIONS } from '@saas-buildkit/validation';
import { AppConfig } from './config/app';
import { setupSwagger, SwaggerConfig } from '@saas-buildkit/swagger-utils';
import { PostgresDbFailedErrorFilter } from '@saas-buildkit/typeorm';
import { LoggingInterceptor } from '@saas-buildkit/logger';

function buildFastifyAdapter() {
  return new FastifyAdapter({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    genReqId: (req: { headers: { [x: string]: any } }) => {
      // eslint-disable-next-line security/detect-object-injection
      const requestId = req.headers[REQUEST_ID_HEADER];
      return requestId || generateRandomId();
    },
  });
}

async function bootstrapBaseWebApp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any | TestingModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalModule?: any,
) {
  const isTestingModule = module instanceof TestingModule;

  // todo wait for the pr in this package to be merged
  //  transition to use AsyncCls instead of ClsHook
  const transactionalContext = getTransactionalContext();

  // this is needed for tests to prevent multiple initializations
  if (!transactionalContext) {
    initializeTransactionalContext();
  }

  if (isTestingModule && originalModule === undefined) {
    throw new Error(
      'If you are using TestingModule, you must pass the original module as the second argument',
    );
  }

  const app = isTestingModule
    ? module.createNestApplication<NestFastifyApplication>(
        buildFastifyAdapter(),
      )
    : await NestFactory.create<NestFastifyApplication>(
        module,
        buildFastifyAdapter(),
        {},
      );

  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();

  // this is a recommendation from fastify to improve compatibility with express middlewares
  fastifyInstance
    .addHook('onRequest', async (req) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.socket['encrypted'] = process.env.NODE_ENV === 'production';
    })
    .decorateReply('setHeader', function (name: string, value: unknown) {
      this.header(name, value);
    })
    .decorateReply('end', function () {
      this.send('');
    });

  useContainer(app.select(originalModule || module), {
    fallbackOnErrors: true,
  });

  app.enableShutdownHooks();

  app.useLogger(app.get(Logger));
  app.flushLogs();

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalPipes(new I18nValidationPipe(DEFAULT_VALIDATION_OPTIONS));

  // order matters here - first filter to catch the error wins and the rest are ignored
  // so first narrow once and then global any exception filter (catch all, if nothing else caught it)
  app.useGlobalFilters(
    new AnyExceptionFilter(httpAdapterHost),
    new OverrideDefaultNotFoundFilter(httpAdapterHost),
    new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost),
    new PostgresDbFailedErrorFilter(httpAdapterHost),
    new HttpExceptionFilter(httpAdapterHost),
    new I18nValidationExceptionFilter(),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const appConfig = app.get(AppConfig);
  const swaggerConfig = app.get(SwaggerConfig);

  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  setupSwagger(swaggerConfig, app);

  await app.listen(appConfig.port, '0.0.0.0');

  return app;
}

export { bootstrapBaseWebApp };
