import { HttpStatus } from '@nestjs/common';

/**
 * This is a proxy http exception that may occur when the call to internal service fails.
 * in such case we need to return to client whatever the internal service returned to us.
 * */
export class InternalProxyHttpException {
  constructor(
    public httpStatus: HttpStatus,
    public responseBody: Record<string, unknown>,
    public responseHeaders: Record<string, string>,
  ) {}
}
