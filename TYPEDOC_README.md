# Softkit - a toolkit for software development on NestJS

### This repository is a work in progress. It is not ready for use.

#### This repo contains a set of libraries for software development on NestJS and NodeJS. It is intended to be used as a framework for building applications.

## Libraries

| Name                                           | Description                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [async-storage](./async-storage/src)           | CLS Module and Service Base Setup                                                                                              |
| [auth](./auth/src)                             | Authorization and Authentication services, to handle various needs                                                             |
| [bootstrap](./bootstrap/src)                   | Application startup utilities                                                                                                  |
| [common-types](./common-types/src)             | Common shareable typescript classes and interfaces                                                                             |
| [config](./config/src)                         | Configuration library to work with app config                                                                                  |
| [crypto](./crypto/src)                         | Crypto library                                                                                                                 |
| [exceptions](./exceptions/src)                 | General exceptions and interceptors for uniform processing                                                                     |
| [health-check](./health-check/src)             | Health Check service and controller                                                                                            |
| [i18n](./i18n/src)                             | i18n library to manage various languages                                                                                       |
| [logger](./logger/src)                         | Common logger for NestJS app                                                                                                   |
| [resource-plugin](./resource-plugin/src)       | Code Generators for generating new libraries, and apps, or updating the existing ones                                          |
| [server-http-client](./server-http-client/src) | Base http client module with retries and circuit breaker configuration                                                         |
| [string-utils](./string-utils/src)             | Just string utilities                                                                                                          |
| [swagger-utils](./swagger-utils/src)           | Swagger module and utilities for exporting specification                                                                       |
| [test-utils](./test-utils/src)                 | Test utils, to simplify tests creation and maintenance                                                                         |
| [typeorm](./typeorm/src)                       | Typeorm configuration and base entities and repositories, with built-in multi-tenancy support, and automatic fields population |
| [typeorm-service](./typeorm-service/src)       | General CRUD services, with built-in pagination, filtering, sorting and generics for single or multi-tenant entities           |
| [validation](./validation/src)                 | The extension library for class-validator, that solves many child issues of class-validator                                    |
