import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';
import { createAxiosInstance } from '../../lib/axios.factory';
import { ClsModule, ClsService } from 'nestjs-cls';
import { IAccessTokenPayload, UserClsStore } from '@softkit/auth';

@Module({
  controllers: [SampleController],

  providers: [
    {
      provide: 'AXIOS',
      useFactory: (cls: ClsService<UserClsStore<IAccessTokenPayload>>) => {
        return createAxiosInstance(cls, {
          url: 'http://localhost:54345',
          timeout: 1000,
          serviceName: 'sample',
        });
      },
      inject: [ClsService],
    },
  ],
  imports: [ClsModule],
})
export class SampleModule {}
