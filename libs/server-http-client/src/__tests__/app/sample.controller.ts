import { BadRequestException, Controller, Get } from '@nestjs/common';

@Controller('sample')
export class SampleController {
  public counters = {
    badRequest: 0,
    success: 0,
    internalServerError: 0,
    everyThird: 0,
  };

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
}
