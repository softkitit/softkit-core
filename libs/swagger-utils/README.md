# Swagger Utils Library

This is a wrapper on top of nestjs-swagger library, that provides automatic configuration and config classes to use in your apps.

It's used explicitly in @softkit/bootstrap library, but you can use it in your apps as well.


Features: 

- It provides a default configuration for swagger
- It will write an open-api.json file to your assets folder, that will be used for generators, to create HTTP client for your app. (*this usually should be disabled in upper environments, and used only locally*). To disable it just remove `docsOutputPath` from your config in all profiles except dev.

## Installation

```bash
yarn add @softkit/swagger-utils
```

## Usage

### Default configuration in your main.ts

```typescript
const swaggerSetup = setupSwagger(swaggerConfig, app);
```

### Ensuring Correct Swagger Path Configuration
The `setupSwagger` function facilitates the accurate configuration of the swagger path, accommodating optional API route prefixes. When an `appPrefix` is provided, the function concatenates it with the swagger path, ensuring the Swagger UI reflects your API's prefixed route structure.

Without an `appPrefix`, the Swagger UI defaults to the standard swagger path.

Example usage with an API prefix 'api/app':

```typescript
const appPrefix = 'api/app'; 
const swaggerSetup = setupSwagger(swaggerConfig, app, appPrefix);
```

### Default configuration in your root config class

```typescript
import { SwaggerConfig } from '@softkit/swagger-utils';

export class RootConfig {
  @Type(() => SwaggerConfig)
  @ValidateNested()
  public readonly swagger!: SwaggerConfig;
}
```

### .env.yaml file

```yaml
swagger:
  title: 'some useful name'
  swaggerPath: /swagger
  enabled: true
  description: 'some useful description'
  version: 1.0.0
  contactName: 'John Doe'
  contactEmail: 'john.doe@softkit.dev'
  contactUrl: https://www.softkit.dev/
  servers:
    - { url: 'http://localhost:9999', description: 'local server' }
```
