import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const hostname = request.hostname;
    const url = request.url;
    const method = request.method;

    this.logger.log(
      `Call Endpoint: ${method} ${url} Hostname: ${hostname} Params: ${JSON.stringify(
        params,
      )}}`,
    );

    return next.handle();
  }
}
