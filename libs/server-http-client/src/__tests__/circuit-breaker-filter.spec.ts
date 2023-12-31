import { Test } from '@nestjs/testing';
import { SampleModule } from './app/sample.module';
import { INestApplication } from '@nestjs/common';
import { createAxiosInstance } from '../lib/axios.factory';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AxiosInstance } from 'axios';
import clearAllMocks = jest.clearAllMocks;
import { SampleController } from './app/sample.controller';
import { InternalProxyHttpExceptionFilter } from '../lib/interceptors/internal-proxy-http.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { expectNotNullAndGet } from '@softkit/test-utils';
import { IAccessTokenPayload, UserClsStore } from '@softkit/auth';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('Circuit breaker and retry with filter', () => {
  let appUrl: string;
  let app: INestApplication;
  let axiosInstance: AxiosInstance;
  let appHost: string;
  let sampleController: SampleController;
  let clsService: ClsService<UserClsStore<IAccessTokenPayload>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ClsModule, SampleModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new InternalProxyHttpExceptionFilter(httpAdapterHost));

    await app.init();
    await app.listen(54_345);

    sampleController = app.get(SampleController);

    clsService = app.get(ClsService);
    appUrl = await app.getUrl();

    const split = appUrl.split(':');
    const appPort = split.at(-1);

    appHost = `http://localhost:${appPort}`;
    axiosInstance = await createAxiosInstance(clsService, {
      timeout: 1000,
      url: appHost,
      serviceName: 'sample',
    });
  });

  afterEach(async () => {
    await app.close();
    clearAllMocks();
  });

  it('call endpoint that calling another failing endpoint', async () => {
    let err;
    try {
      await axiosInstance.get('/sample/self-call-fail');
    } catch (error) {
      err = error;
    }

    const error = expectNotNullAndGet(err) as any;

    expect(error.status).toBe(500);
    expect(error.response.statusText).toBe('Internal Server Error');
    expect(sampleController.counters.internalServerError).toBe(1);
    expect(sampleController.counters.selfCallFail).toBe(1);
  });
});
