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
import { AppConfig } from './config/app.config';
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
import { callOrUndefinedIfException } from './utils/functions';
import type { TestingModule } from '@nestjs/testing';

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
    // todo generalize
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
  const isTestingModule = module?.constructor?.name === 'TestingModule';

  if (isTestingModule && originalModule === undefined) {
    throw new Error(
      'If you are using TestingModule, you must pass the original module as the second argument',
    );
  }

  return isTestingModule
    ? (module as TestingModule).createNestApplication<NestFastifyApplication>(
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
    .decorateReply(
      'setHeader',
      /* istanbul ignore next */ function (name: string, value: unknown) {
        this.header(name, value);
      },
    )
    .decorateReply(
      'end',
      /* istanbul ignore next */ function () {
        this.send('');
      },
    );
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

  const ds = callOrUndefinedIfException(() => app.get(DataSource));
  const seeders = app.get(TYPEORM_SEEDERS_TOKEN);
  const factories = app.get(TYPEORM_FACTORIES_TOKEN);

  if (seeders.length === 0) {
    return logger.warn(
      'Warning: No seeders found. Ensure you have provided seeders if you are expecting database seeding to occur.',
    );
  }

  if (ds instanceof DataSource) {
    await runSeeders(ds, {
      seeds: seeders,
      factories,
    });
  } else {
    logger.warn(
      'Seems like run seeds is enabled, but there is no data source provided, this seems like a mistake. Please review or disable seed run',
    );
  }
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

  process.on('uncaughtException', function (err) {
    // Handle the error safely
    logger.error('Uncaught exception: %o', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    // Handle the error safely
    logger.error(
      'Unhandled Rejection at: Promise: %o, reason: %s',
      promise,
      reason,
    );
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalPipes(new I18nValidationPipe(DEFAULT_VALIDATION_OPTIONS));

  // so first global one and then narrow
  setupGlobalFilters(app, httpAdapterHost);
  setupGlobalInterceptors(app);

  const appConfig = app.get(AppConfig);
  const dbConfig = callOrUndefinedIfException(() => app.get(DbConfig));
  const swaggerConfig = callOrUndefinedIfException(() =>
    app.get(SwaggerConfig),
  );
  app.enableCors(appConfig.cors);

  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (swaggerConfig instanceof SwaggerConfig) {
    const swaggerSetup = setupSwagger(swaggerConfig, app, appConfig.prefix);
    const swaggerPath = `${appConfig.prefix}${swaggerConfig.swaggerPath}`;

    if (swaggerSetup) {
      logger.log(`Swagger is listening on ${swaggerPath}`);
    } else {
      logger.log(`Swagger is disabled by config, skipping...`);
    }
  } else {
    logger.debug(
      `SwaggerConfig instance is not provided so swagger turned off by default, skipping... Details: %o`,
      swaggerConfig,
    );
  }

  if (dbConfig instanceof DbConfig) {
    await runDatabaseSeeders(app, logger, dbConfig.runSeeds);
  }

  await app.listen(appConfig.port, '0.0.0.0');

  logger.log(`App successfully started. Listening on port ${appConfig.port}`);

  return app;
}
