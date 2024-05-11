import { ClsService, ClsStore } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'node:http';

import { LoggerConfig } from './config/logger';

export function setupLoggerModule<ClsType extends ClsStore>(
  customProps: (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    clsService?: ClsService<ClsType>,
  ) => Record<string, string> = () => ({}),
) {
  return LoggerModule.forRootAsync({
    useFactory: async (
      loggerConfig: LoggerConfig,
      clsService?: ClsService<ClsType>,
    ) => {
      return {
        renameContext: 'class',
        pinoHttp: {
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },
          customProps: (req, res) => {
            return customProps(req, res, clsService);
          },
          customSuccessObject: (
            req: IncomingMessage,
            res: ServerResponse,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            val: any,
          ) => {
            return {
              reqId: req.id,
              responseTime: val.responseTime,
            };
          },
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
            }),
          },
          customErrorObject: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            val: any,
          ) => {
            return {
              statusMessage: res.statusMessage,
              statusCode: res.statusCode,
              err: val.err,
            };
          },
          customReceivedMessage: (req: IncomingMessage) => {
            return `Call Endpoint: ${req.method} ${req.url}`;
          },
          customSuccessMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            responseTime: number,
          ) => {
            return `Finished Endpoint: ${req.method} ${req.url} for ${responseTime}ms`;
          },
          customErrorMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error,
          ) => {
            return `Failed Endpoint: ${req.method} ${req.url} Error - ${error.message}.`;
          },
          // eslint-disable-next-line complexity
          customLogLevel: function (req, res, err) {
            if (res.statusCode >= 400 && res.statusCode < 500) {
              return 'info';
            } else if (res.statusCode >= 500 || err) {
              return 'error';
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
              return 'silent';
            }
            return 'info';
          },

          quietReqLogger: true,
          autoLogging: true,
          // Define additional custom request properties
          level: loggerConfig.defaultLevel,
          // install 'pino-pretty' package in order to use the following option
          transport: loggerConfig.prettyLogs
            ? { target: 'pino-pretty' }
            : undefined,
        },
      };
    },
    inject: [LoggerConfig, { token: ClsService, optional: true }],
    providers: [],
  });
}
