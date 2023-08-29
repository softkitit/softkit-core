import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InternalProxyHttpException } from '../exceptions/internal-proxy-http.exception';
import { FastifyReply } from 'fastify';

@Catch(InternalProxyHttpException)
export class InternalProxyHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: InternalProxyHttpException, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response: FastifyReply = ctx.getResponse();

    httpAdapter.reply(response, exception.response.data, exception.status);
  }
}
