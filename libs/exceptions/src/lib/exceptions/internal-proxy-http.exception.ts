import { HttpStatus } from '@nestjs/common';

/**
 * This is a proxy http exception that may occur when the call to internal service fails.
 * in such case we need to return to client whatever the internal service returned to us.
 * Field names here matches the need of axios retry library
 * */
export class InternalProxyHttpException {
  constructor(
    public status: HttpStatus,
    public response: object,
    public config: object,
  ) {}
}
