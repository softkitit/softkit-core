import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpClientConfig } from './config/http-client.config';
import { ClsService } from 'nestjs-cls';
import { UserRequestClsStore } from './vo/user-request-cls-store';
import { REQUEST_ID_HEADER } from './constants';
import CircuitBreaker from 'opossum';
import axiosRetry from 'axios-retry';
import { RetryType } from './config/vo/retry-type';
import { InternalServiceUnavailableHttpException } from '@saas-buildkit/exceptions';
import { InternalProxyHttpException } from './exceptions/internal-proxy-http.exception';

function configureRetries(
  config: HttpClientConfig,
  axiosInstance: AxiosInstance,
) {
  const retryConfig = config.retryConfig;

  if (retryConfig === undefined) {
    return axiosInstance;
  }

  switch (retryConfig?.retryType) {
    case RetryType.EXPONENTIAL: {
      axiosRetry(axiosInstance, {
        retries: retryConfig.retriesCount + 1,
        retryDelay: (retryCount: number, error: AxiosError) =>
          axiosRetry.exponentialDelay(retryCount, error, retryConfig.delay),
      });
      break;
    }
    case RetryType.LINEAR: {
      axiosRetry(axiosInstance, {
        retries: retryConfig.retriesCount,
        retryDelay: (retryCount: number) => retryCount * retryConfig.delay,
      });
      break;
    }
    case RetryType.STATIC: {
      axiosRetry(axiosInstance, {
        retries: retryConfig.retriesCount,
        retryDelay: () => retryConfig.delay,
      });
      break;
    }
    default: {
      // this is obvious developer mistake that will be caught on app start
      /* istanbul ignore next */
      throw new Error(
        `Invalid retry type for http client, please check your config. RetryType - ${retryConfig.retryType}`,
      );
    }
  }

  return axiosInstance;
}

function proxyHttpException(serviceName: string) {
  return (error: AxiosError | Error) => {
    if ('code' in error) {
      const response = error.response;
      // eslint-disable-next-line sonarjs/no-small-switch
      switch (error.code) {
        case 'ETIMEDOUT':
        case 'EOPENBREAKER': {
          throw new InternalServiceUnavailableHttpException(serviceName, error);
        }

        default: {
          if (response) {
            throw new InternalProxyHttpException(
              response.status,
              response,
              error.config,
              error,
            );
          }
          // this will be reported as internal server error by default filter
          /* istanbul ignore next */
          throw error;
        }
      }
    }

    throw error;
  };
}

export async function createAxiosInstance<T extends UserRequestClsStore>(
  clsService: ClsService<T>,
  config: HttpClientConfig,
  axiosAdditionalConfig: AxiosRequestConfig = {},
): Promise<AxiosInstance> {
  async function proxyCall(axiosRequestConfig: AxiosRequestConfig) {
    return await axios({
      ...axiosRequestConfig,
      baseURL: config.url,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let circuitBreaker: CircuitBreaker<[AxiosRequestConfig<any>], any>;

  if (config.circuitBreakerConfig) {
    circuitBreaker = new CircuitBreaker(proxyCall, {
      ...config.circuitBreakerConfig,
      name: config.serviceName,
      capacity: config.circuitBreakerConfig.maxConcurrentRequests,
    });
  }

  const originalInstance = axios.create({
    ...axiosAdditionalConfig,
    ...config,
    baseURL: config.url,
  });

  const axiosInstance = configureRetries(config, originalInstance);

  axiosInstance.interceptors.response.use(
    (value) => value,
    proxyHttpException(config.serviceName),
  );

  axiosInstance.interceptors.request.use((request) => {
    const store = clsService.get();
    if (store) {
      // TODO pass also i18n information
      request.headers['Authorization'] = store.authHeader;
      // eslint-disable-next-line security/detect-object-injection
      request.headers[REQUEST_ID_HEADER] = store.reqId;
    }
    if (circuitBreaker) {
      request.adapter = async (c) => {
        return await circuitBreaker.fire({
          ...c,
          adapter: undefined,
        });
      };
    }

    return request;
  });

  return axiosInstance;
}
