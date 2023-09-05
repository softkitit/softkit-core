import { Module, Provider } from '@nestjs/common';
import { PLATFORM_CLIENT_TOKEN } from './constants';
import {
  createAxiosInstance,
  UserRequestClsStore,
} from '@softkit/server-http-client';
import { ClsService } from 'nestjs-cls';
import * as AllApis from './generated/api';
import { AxiosInstance } from 'axios';
import { PlatformClientConfig } from './config/platform-client.config';
import { ROOT_CONFIG_ALIAS_TOKEN } from '@softkit/config';
import { BaseAPI } from './generated/base';

const ApiClasses = Object.values(AllApis).filter((a) => {
  return typeof a === 'function' && a.name.endsWith('Api');
}) as (typeof BaseAPI)[];

@Module({
  providers: [
    {
      provide: PLATFORM_CLIENT_TOKEN,
      useFactory: (
        clsService: ClsService<UserRequestClsStore>,
        config: PlatformClientConfig,
      ) => {
        return createAxiosInstance(clsService, config.platformClient);
      },
      inject: [ClsService, ROOT_CONFIG_ALIAS_TOKEN],
    },
    ...ApiClasses.map((ApiClass) => ({
      provide: ApiClass,
      useFactory: (axiosInstance: AxiosInstance) =>
        new ApiClass(undefined, undefined, axiosInstance),
      inject: [PLATFORM_CLIENT_TOKEN],
    })).map((a) => a as Provider),
  ],
  exports: ApiClasses.map((a) => a as Provider),
})
export class PlatformClientModule {}
