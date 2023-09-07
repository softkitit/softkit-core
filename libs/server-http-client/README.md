# Server Http Client

This library provides an advanced http client for nestjs applications.

It designed to be used to communicate with other nestjs applications or any other http services.

It requires to have [Axios](https://axios-http.com/docs/intro) installed, and it relies on it

---


## Features

- It has built-in configurable retry mechanism (linear, static or exponential)
- It has built-in configurable circuit breaker mechanism
- Circuit breaker using a local memory cache to store state of the circuit
- Circuit breaker and retry mechanism can be configured per request and can be configured together, but you need to have a clear understanding how system will behave when both are configured
- This libraries provides InternalProxyHttpExceptionFilter that will convert any exception to InternalProxyHttpException

  This is useful for internal communication between services, so if you call another service, and it returns any error it will be converted to InternalProxyHttpException and you can handle it if you want to, but in most cases if any of your internal service returns an error you should just return it to the client, as is. It simplifies error handling for communication between microservices. 
- It has built-in configurable timeout mechanism, you don't want to hang for 30 seconds waiting for response from the server.
- It relies on ClsService for auth token and request id propagation between services, so you don't need to worry about it, it will be done automatically for you.  

Note: 

You quite rarely need to use this library directly, it is used by code generator, to create automatically generated http clients for your apps and libraries.

---

## Installation

```bash
yarn add @softkit/server-http-client
```

---

## Create http client


```typescript

@Module({

  providers: [
    {
      provide: 'AXIOS',
      useFactory: (cls: ClsService<UserRequestClsStore>) => {
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
export class YourAppModule {}
```

## Inject and use 

```typescript

@Controller('sample')
export class SampleController {
  constructor(@Inject('AXIOS') private readonly axios: AxiosInstance) {}
}
```


