import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

/**
 * This is a proxy http exception that may occur when the call to internal service fails.
 * in such case we need to return to client whatever the internal service returned to us.
 * Field names here matches the need of axios retry library
 * */
export class InternalProxyHttpException {
  constructor(
    public status: HttpStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public response: AxiosResponse<any>,
    public config?: object,
    public rootCause?: unknown,
  ) {}
}
