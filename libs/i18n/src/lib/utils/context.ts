import { ArgumentsHost, ExecutionContext, Logger } from '@nestjs/common';

const logger = new Logger('I18nService');

export function getContextObject(
  context?: ExecutionContext | ArgumentsHost,
): any {
  if (!context) {
    logger.warn('The context is undefined');
    return undefined;
  }
  const contextType = context?.getType<string>() ?? 'undefined';

  switch (contextType) {
    case 'http': {
      return context.switchToHttp().getRequest();
    }
    case 'graphql': {
      return context.getArgs()[2];
    }
    case 'rpc': {
      return context.switchToRpc().getContext();
    }
    case 'rmq': {
      return context.getArgs()[1];
    }
    default: {
      logger.warn(`context type: ${contextType} not supported`);
    }
  }
}
