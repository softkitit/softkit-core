import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Inject,
} from '@nestjs/common';
import { AxiosInstance } from 'axios';

@Controller('sample')
export class SampleController {
  public counters = {
    badRequest: 0,
    success: 0,
    internalServerError: 0,
    selfCallFail: 0,
    everyThird: 0,
    wait: 0,
  };

  constructor(@Inject('AXIOS') private readonly axios: AxiosInstance) {}

  @Get('always-bad-request')
  async alwaysBadRequest() {
    this.counters.badRequest++;
    throw new BadRequestException('Bad request');
  }

  @Get('always-success')
  async alwaysSuccess() {
    this.counters.success++;

    return {
      success: true,
    };
  }

  @Get('always-internal-server-error')
  async alwaysInternalServerError() {
    this.counters.internalServerError++;
    throw new Error('Internal server error');
  }

  @Get('self-call-fail')
  async selfCallFail() {
    this.counters.selfCallFail++;

    await this.axios.get('/sample/always-internal-server-error');

    // unreachable code
    /* istanbul ignore next */
    return {
      success: true,
    };
  }

  @Get('failing-every-third')
  async failingEveryThird() {
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      if (this.counters.everyThird % 3 !== 0) {
        throw new Error('Internal server error');
      }
      return true;
    } finally {
      this.counters.everyThird++;
    }
  }

  @Get('get-passed-headers')
  async getPassedHeaders(@Headers() headers: Record<string, string>) {
    return headers;
  }

  @Get('wait-for-2s')
  async waitForTwoSeconds() {
    this.counters.wait++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      success: true,
    };
  }
}
