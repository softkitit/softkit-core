import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SampleQueryParam } from './vo/sample-query.dto';
import { SampleDto } from './vo/sample.dto';
import { SampleSort } from './vo/sample-sort.dto';

@Controller('/sample')
export class SampleController {
  @Post()
  async create(@Body() dto: SampleDto) {
    return dto;
  }

  @Get()
  async get(@Query() dto: SampleQueryParam) {
    return dto;
  }

  @Get('sort')
  async getSort(@Query() dto: SampleSort) {
    return dto;
  }
}
