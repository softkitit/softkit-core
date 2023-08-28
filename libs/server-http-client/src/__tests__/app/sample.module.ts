import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';

@Module({
  controllers: [SampleController],
})
export class SampleModule {}
