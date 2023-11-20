import { Test } from '@nestjs/testing';
import { SampleModule } from './app/sample.module';
import { INestApplication } from '@nestjs/common';
import { HttpRetryConfig } from '../lib/config/http-retry.config';
import { RetryType } from '../lib/config/vo/retry-type';
import { HttpCircuitBreakerConfig } from '../lib/config/http-circuit-breaker.config';
import { createAxiosInstance } from '../lib/axios.factory';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AxiosInstance, AxiosResponse } from 'axios';
import clearAllMocks = jest.clearAllMocks;
import { SampleController } from './app/sample.controller';
import { InternalServiceUnavailableHttpException } from '@softkit/exceptions';
import { REQUEST_ID_HEADER } from '../lib/constants';
import { InternalProxyHttpException } from '../lib/exceptions/internal-proxy-http.exception';
import { InternalProxyHttpExceptionFilter } from '../lib/interceptors/internal-proxy-http.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { IAccessTokenPayload, UserClsStore } from '@softkit/auth';
import { FastifyAdapter } from '@nestjs/platform-fastify';

const defaultRetryConfig: HttpRetryConfig = {
  retriesCount: 3,
  retryType: RetryType.STATIC,
  delay: 100,
};

const defaultCircuitBreakerConfig: HttpCircuitBreakerConfig = {
  timeout: 1000,
  resetTimeout: 1000,
  errorThresholdPercentage: 63,
  volumeThreshold: 10,
  rollingCountTimeout: 10_000,
};

describe('Circuit breaker and retry', () => {
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
    await app.listen(0);

    sampleController = app.get(SampleController);

    clsService = app.get(ClsService);
    appUrl = await app.getUrl();

    const split = appUrl.split(':');
    const appPort = split.at(-1);

    appHost = `http://localhost:${appPort}`;
    axiosInstance = await createAxiosInstance(clsService, {
      timeout: 1000,
      circuitBreakerConfig: defaultCircuitBreakerConfig,
      url: appHost,
      retryConfig: defaultRetryConfig,
      serviceName: 'sample',
    });
  });

  afterEach(async () => {
    await app.close();
    clearAllMocks();
  });

  it('send success requests without any errors', async () => {
    const allResponses = Array.from({ length: 100 }).map(() => {
      return axiosInstance.get('/sample/always-success');
    });

    await Promise.all(allResponses).then((responses) => {
      expect(responses.length).toBe(100);
      for (const response of responses) {
        expect(response.status).toBe(200);
        expect(response.data).toStrictEqual({ success: true });
      }
    });

    expect(sampleController.counters.success).toBe(100);
  });

  it(`bad request response shouldn't cause any retries or circuit breaker activities`, async () => {
    const allResponses = Array.from({ length: 100 }).map(() => {
      return axiosInstance.get('/sample/always-bad-request');
    });

    await Promise.allSettled(allResponses).then((responses) => {
      expect(responses.length).toBe(100);
      for (const response of responses) {
        expect(response.status).toBe('rejected');

        const err = response.status === 'rejected' && response.reason;
        expect(err.status).toBe(400);
      }
    });

    expect(sampleController.counters.badRequest).toBe(100);
  });

  it('should handle timeout properly', async () => {
    await expect(
      axiosInstance.get('/sample/wait-for-2s'),
    ).rejects.toBeInstanceOf(InternalServiceUnavailableHttpException);
    // do not retry on timeouts
    expect(sampleController.counters.wait).toBe(1);
  });

  it('send failed requests and fallback to the fallback function', async () => {
    const requests = Array.from({ length: 10 });

    const allResponses = [];

    for (const request of requests) {
      try {
        const axiosResponse = await axiosInstance.get(
          '/sample/failing-every-third',
        );
        allResponses.push(axiosResponse);
      } catch (error) {
        allResponses.push(error);
      }
    }

    /**
     * there were 11 http requests in total,
     * but only 5 unique requests and 6 retries
     *
     * 1 - success
     * 2 - failed
     *   2.1. - retry (failed)
     *   2.2. - retry (success)
     * 3 - failed
     *  3.1. - retry (failed)
     *  3.2. - retry (success)
     * 4 - failed
     *  4.1. - retry (failed)
     *  4.2. - retry (success)
     * 5 - failed (circuit breaker opened)
     *
     *  after this, we have 11 requests in total that is matching with the volumeThreshold
     *  and our success to error ration is 6/10 = 60% that is less than the errorThresholdPercentage yet
     *  so the circuit breaker will be closed (no rejections)
     *  but next request will be failing with 500
     *  that will change the stats to 7/11 = 63.63% that is more than the errorThresholdPercentage
     *  so the circuit breaker will be opened (rejections by client)
     * */

    // 11 because counter incrementing on finally
    expect(sampleController.counters.everyThird).toBe(11);

    // all first 4 requests must be successful
    for (const response of allResponses.slice(0, 4)) {
      const r = response as AxiosResponse;
      expect(r.status).toBe(200);
    }

    // all remaining responses must be failed because of closed broker
    for (const response of allResponses.slice(4)) {
      const r = response as InternalServiceUnavailableHttpException;
      expect(r.title).toBe('exception.SERVICE_UNAVAILABLE.TITLE');
      expect(r.status).toBe(503);
    }

    // all other requests must be failed because the breaker will be closed
    for (const response of allResponses.slice(0, 4)) {
      const r = response as AxiosResponse;
      expect(r.status).toBe(200);
    }

    await new Promise((resolve) => setTimeout(resolve, 1100));

    // this will trigger an opening of the circuit breaker
    const responseAfterWaitingForSecond = await axiosInstance.get(
      '/sample/always-success',
    );

    expect(responseAfterWaitingForSecond.status).toBe(200);

    const [error] = await Promise.allSettled([
      axiosInstance.get('/sample/always-internal-server-error'),
    ]);
    // should return original error from the server

    expect(error.status).toBe('rejected');

    const err = error.status === 'rejected' && error.reason;

    expect(err.status).toBe(500);
    expect(err.response).toBeDefined();
    expect(err.response.statusText).toBe('Internal Server Error');
    expect(err.config).toBeDefined();
  });

  it('Retry and circuit breaker with presetting auth token using cls service', async () => {
    const clsData: UserClsStore<IAccessTokenPayload> = {
      authHeader: 'Bearer authHeader',
      tenantId: 'tenantId',
      userId: 'userId',
      reqId: 'reqId',
      jwtPayload: {
        email: 'bla@gmail.com',
        sub: 'userId',
      },
    };

    await clsService.runWith(clsData, async () => {
      const axiosResponse = await axiosInstance.get(
        '/sample/get-passed-headers',
      );

      expect(axiosResponse.status).toBe(200);
      const resultData = axiosResponse.data;

      expect({
        Authorization: resultData['authorization'],
        [REQUEST_ID_HEADER]: resultData[REQUEST_ID_HEADER],
      }).toStrictEqual({
        Authorization: clsData.authHeader,
        [REQUEST_ID_HEADER]: clsData.reqId,
      });
    });
  });

  describe('Just retry', () => {
    let axiosInstanceWithoutCircuitBreaker: AxiosInstance;

    beforeEach(async () => {
      axiosInstanceWithoutCircuitBreaker = await createAxiosInstance(
        clsService,
        {
          timeout: 1000,
          url: appHost,
          retryConfig: defaultRetryConfig,
          serviceName: 'sample',
        },
      );
    });

    afterEach(async () => {
      await app.close();
      clearAllMocks();
    });

    it('got internal server error with retry only: with retry %s', async () => {
      const allResponses = await Promise.allSettled(
        Array.from({ length: 100 }).map(() => {
          return axiosInstanceWithoutCircuitBreaker.get(
            '/sample/always-internal-server-error',
          );
        }),
      );

      expect(sampleController.counters.internalServerError).toBe(400);

      expect(allResponses.length).toBe(100);
      for (const response of allResponses) {
        const err = response.status === 'rejected' && response.reason;
        expect(err).toBeInstanceOf(InternalProxyHttpException);
        expect(err.status).toBe(500);
        expect(err.response).toBeDefined();
        expect(err.response.statusText).toBe('Internal Server Error');
      }
    });

    it.each([RetryType.STATIC, RetryType.LINEAR, RetryType.EXPONENTIAL])(
      'internal server error with different retries : %s',
      async (retryType) => {
        const axiosInstanceWithRetry = await createAxiosInstance(clsService, {
          timeout: 2000,
          url: appHost,
          serviceName: 'sample',
          retryConfig: {
            ...defaultRetryConfig,
            retryType,
          },
        });

        try {
          await axiosInstanceWithRetry.get(
            '/sample/always-internal-server-error',
          );
        } catch {
          /* empty */
        }

        expect(sampleController.counters.internalServerError).toBe(4);
      },
    );

    it('unknown retry type', async () => {
      await expect(
        createAxiosInstance(clsService, {
          timeout: 2000,
          url: appHost,
          serviceName: 'sample',
          retryConfig: {
            ...defaultRetryConfig,
            retryType: 'unknown' as RetryType,
          },
        }),
      ).rejects.toThrow(
        'Invalid retry type for http client, please check your config. RetryType - unknown',
      );
    });
  });

  describe('Just circuit breaker', () => {
    let axiosInstanceWithoutRetries: AxiosInstance;

    beforeEach(async () => {
      axiosInstanceWithoutRetries = await createAxiosInstance(clsService, {
        timeout: 1000,
        url: appHost,
        circuitBreakerConfig: {
          ...defaultCircuitBreakerConfig,
        },
        serviceName: 'sample',
      });
    });

    afterEach(async () => {
      await app.close();
      clearAllMocks();
    });

    /** the explanation is the same as without retries method, check above*/
    it('every third failure without retry', async () => {
      const requests = Array.from({ length: 100 });

      const allResponses = [];

      for (const request of requests) {
        try {
          const axiosResponse = await axiosInstanceWithoutRetries.get(
            '/sample/failing-every-third',
          );
          allResponses.push(axiosResponse);
        } catch (error) {
          allResponses.push(error);
        }
      }
      expect(sampleController.counters.everyThird).toBe(11);

      // every third request must be success
      const successResponses = allResponses
        .slice(0, 11)
        .filter((_, i) => i % 3 === 0);

      for (const v of successResponses) {
        expect((v as AxiosResponse).status).toBe(200);
      }

      const allFailed = allResponses.slice(0, 11).filter((_, i) => i % 3 !== 0);

      for (const v of allFailed) {
        const err = v as InternalProxyHttpException;
        expect(err.status).toBe(500);
        expect(err.config).toBeDefined();
        expect(err.response).toBeDefined();
      }

      // all other should be locked by circuit breaker
      for (const v of allResponses.slice(11)) {
        const err = v as InternalServiceUnavailableHttpException;
        expect(err.status).toBe(503);
        expect(err.title).toBe('exception.SERVICE_UNAVAILABLE.TITLE');
      }

      expect(allResponses.length).toBe(100);
    });
  });
});
