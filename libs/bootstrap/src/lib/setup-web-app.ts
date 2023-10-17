import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TestingModule } from '@nestjs/testing/testing-module';
import { useContainer } from 'class-validator';
import { FastifyInstance } from 'fastify/types/instance';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from '@saas-buildkit/nestjs-i18n';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
import { generateRandomId } from '@softkit/crypto';
import { runSeeders } from 'typeorm-extension';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
} from '@softkit/exceptions';
import { DEFAULT_VALIDATION_OPTIONS } from '@softkit/validation';
import { AppConfig } from './config/app';
import { setupSwagger, SwaggerConfig } from '@softkit/swagger-utils';
import {
  DbConfig,
  PostgresDbQueryFailedErrorFilter,
  TYPEORM_FACTORIES_TOKEN,
  TYPEORM_SEEDERS_TOKEN,
} from '@softkit/typeorm';
import { LoggingInterceptor } from '@softkit/logger';
import { responseBodyFormatter } from '@softkit/i18n';
import { REQUEST_ID_HEADER } from '@softkit/server-http-client';
import { fastifyHelmet } from '@fastify/helmet';
import { DataSource } from 'typeorm';
export function buildFastifyAdapter() {
  return new FastifyAdapter({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    genReqId: (req: { headers: { [x: string]: any } }) => {
      // eslint-disable-next-line security/detect-object-injection
      const requestId = req.headers[REQUEST_ID_HEADER];
      return requestId || generateRandomId();
    },
  });
}

export function setupGlobalFilters(
  app: INestApplication,
  httpAdapterHost: HttpAdapterHost,
) {
  app.useGlobalFilters(
    new AnyExceptionFilter(httpAdapterHost),
    new OverrideDefaultNotFoundFilter(httpAdapterHost),
    new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost),
    new PostgresDbQueryFailedErrorFilter(httpAdapterHost),
    new HttpExceptionFilter(httpAdapterHost),
    new I18nValidationExceptionFilter({
      responseBodyFormatter,
      detailedErrors: true,
    }),
  );
}

export async function createNestWebApp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any | TestingModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalModule?: any,
) {
  const isTestingModule = module instanceof TestingModule;

  if (isTestingModule && originalModule === undefined) {
    throw new Error(
      'If you are using TestingModule, you must pass the original module as the second argument',
    );
  }

  return isTestingModule
    ? module.createNestApplication<NestFastifyApplication>(
        buildFastifyAdapter(),
      )
    : await NestFactory.create<NestFastifyApplication>(
        module,
        buildFastifyAdapter(),
        {},
      );
}

export function applyExpressCompatibilityRecommendations(
  fastifyInstance: FastifyInstance,
) {
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
}

function setupGlobalInterceptors(app: INestApplication) {
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
}

async function runDatabaseSeeders(
  app: INestApplication,
  logger: Logger,
  shouldRunSeeds: boolean,
) {
  if (!shouldRunSeeds) {
    return;
  }

  const ds = app.get(DataSource);
  const seeders = app.get(TYPEORM_SEEDERS_TOKEN);
  const factories = app.get(TYPEORM_FACTORIES_TOKEN);

  if (seeders.length === 0) {
    return logger.warn(
      'Warning: No seeders found. Ensure you have provided seeders if you are expecting database seeding to occur.',
    );
  }

  await runSeeders(ds, {
    seeds: [...seeders],
    factories: [...factories],
  });
}

export async function bootstrapBaseWebApp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any | TestingModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalModule?: any,
) {
  // todo wait for the pr in this package to be merged
  //  transition to use AsyncCls instead of ClsHook
  const transactionalContext = getTransactionalContext();

  // this is needed for tests to prevent multiple initializations
  if (!transactionalContext) {
    initializeTransactionalContext();
  }

  const app = await createNestWebApp(module, originalModule);
  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  applyExpressCompatibilityRecommendations(fastifyInstance);

  app.register(fastifyHelmet, {});

  useContainer(app.select(originalModule || module), {
    fallbackOnErrors: true,
  });

  app.enableShutdownHooks();

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalPipes(new I18nValidationPipe(DEFAULT_VALIDATION_OPTIONS));

  // so first global one and then narrow
  setupGlobalFilters(app, httpAdapterHost);
  setupGlobalInterceptors(app);

  const appConfig = app.get(AppConfig);
  const dbConfig = app.get(DbConfig);
  const swaggerConfig = app.get(SwaggerConfig);

  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const swaggerSetup = setupSwagger(swaggerConfig, app);

  if (swaggerSetup) {
    logger.log(`Swagger is listening on ${swaggerConfig.swaggerPath}`);
  } else {
    logger.log(`Swagger is disabled by config, skipping...`);
  }

  await runDatabaseSeeders(app, logger, dbConfig.runSeeds);

  await app.listen(appConfig.port, '0.0.0.0');

  logger.log(`App successfully started. Listening on port ${appConfig.port}`);

  return app;
}
