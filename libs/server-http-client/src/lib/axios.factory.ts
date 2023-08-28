import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { HttpClientConfig } from './config/http-client.config';
import { ClsService } from 'nestjs-cls';
import { UserRequestClsStore } from './vo/user-request-cls-store';
import { REQUEST_ID_HEADER } from './constants';
import * as CircuitBreaker from 'opossum';
import axiosRetry from 'axios-retry';
import { RetryType } from './config/vo/retry-type';

export interface AxiosInterceptorsOptions {
  modifyRequest?: (
    request: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  returnResponseToClientInCaseOfError: boolean;
}

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
      throw new Error(
        `Invalid retry type for http client, please check your config. ${config}`,
      );
    }
  }

  return axiosInstance;
}

// function proxyHttpException() {
//   return (response: AxiosResponse) => {
//     if (response.status < 200 || response.status >= 300) {
//       throw new InternalProxyHttpException(
//         response.status,
//         response.data,
//         response.headers as Record<string, string>,
//       );
//     }
//
//     return response;
//   };
// }

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
      capacity: config.circuitBreakerConfig.maxConcurrentRequests,
    });

    // circuitBreaker.fallback(
    //   (config: AxiosRequestConfig, error?: AxiosError) => {
    //     if (error?.response && options.returnResponseToClientInCaseOfError) {
    //       proxyHttpException()(error.response);
    //     }
    //     throw error;
    //   },
    // );
  }

  const axiosInstance = axios.create({
    ...axiosAdditionalConfig,
    ...config,
  });

  // if (options.returnResponseToClientInCaseOfError) {
  //   axiosInstance.interceptors.response.use(proxyHttpException());
  // }

  axiosInstance.interceptors.request.use((request) => {
    const store = clsService.get();
    if (store) {
      request.headers['Authorization'] = store.authHeader;
      // eslint-disable-next-line security/detect-object-injection
      request.headers[REQUEST_ID_HEADER] = store.reqId;
    }
    if (circuitBreaker) {
      request.adapter = async (config) => {
        return await circuitBreaker.fire({
          ...config,
          adapter: undefined,
        });
      };
    }

    return request;
  });

  return configureRetries(config, axiosInstance);
}
