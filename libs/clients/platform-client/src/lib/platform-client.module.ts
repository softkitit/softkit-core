import { Module } from '@nestjs/common';
import { PLATFORM_CLIENT_TOKEN } from './constants';
import {
  createAxiosInstance,
  UserRequestClsStore,
} from '@saas-buildkit/server-http-client';
import { ClsService } from 'nestjs-cls';
import { AuthApi, RolesApi, TenantsApi } from './generated';
import { AxiosInstance } from 'axios';
import { PlatformClientConfig } from './config/platform-client-config';
import { ROOT_CONFIG_ALIAS_TOKEN } from '@saas-buildkit/config';

const ApiClasses = [TenantsApi, RolesApi, AuthApi];

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
    })),
  ],
  exports: [...ApiClasses],
})
export class PlatformClientModule {}
