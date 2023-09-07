# Exceptions Library 

This library provides a set of general exceptions and interceptors for exceptions to follow the same structure based on [RFC7807](https://www.rfc-editor.org/rfc/rfc7807#section-3.1)

It can be used outside Softkit projects

## Why we need it all? 

- To have a unified way to handle exceptions
- To have ability to document exceptions properly in swagger
- To have a unified way to handle exceptions on client side
- To have a unified way to handle exceptions on server side and even proxy them to client side if you call internal service
- To have a unified way to handle exceptions in logs
- To have a unified way to understand what is a real exception and what is a business logic error. This allows to create an efficient and proactive support for customers.

## Installation

```bash
yarn add @softkit/exceptions
```

You can also use [@softkit/bootstrap](https://www.npmjs.com/package/@softkit/bootstrap) to bootstrap your app with all default interceptors and filters.

This library is also tight to [nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n), this allows us to easily change default messaging for the library or if you are ok with what we have just use default (*only english is available*)


## Usage


### Default interceptors

- **AnyExceptionFilter** - will catch any exception and return http status 500
- **HttpExceptionFilter** - will catch any exception which is instance of AbstractHttpException and return http status from exception
- **ForbiddenExceptionFilter** - will catch NestJS ForbiddenException and return http status 403, but with our **RFC** format
- **NotFoundExceptionFilter** - will catch NestJS NotFoundException and return http status 404, but with our **RFC** format

### Available exceptions




### You can create your own exception it will be handled by default interceptor, and returned in a unified format. See ErrorResponse class. 

```typescript
import { AbstractHttpException } from '@softkit/exceptions';

export class YourException extends AbstractHttpException {
  constructor(rootCause?: unknown) {
    super(
      i18nString('exception.YOUR_EXCEPTION.TITLE'),
      i18nString('exception.YOUR_EXCEPTION.GENERAL_DETAIL'),
      HttpStatus.FORBIDDEN,
      undefined,
      rootCause,
    );
  }
}
```

### Override wording

To override the default titles and details, you can take a localisation `exception.json` file from this library and inject it to your project

Load it with nestjs-i18n and substitution will be done automatically

You can also package this file to your localisation library to distribute across your organisation.


```
exception.json file is packaged to this repo and need to referenced and loadded in your app

if you won't load it you will see default keys for i18n
```




