# Platform Http Client Library

This library provides a simple http client for the platform application.

It's auto generated using openapi-generator.

## Installation

```bash
yarn add @softkit/platform-client
```

## Usage

### Add to your env.yml file

```yaml
platformClient:
  url: http://localhost:9999
  serviceName: platform
```

### Update your root.config.ts, it needs to implement the appropriate config interface 


```typescript
import { HttpClientConfig } from '@softkit/server-http-client';
import { PlatformClientConfig } from '@softkit/platform-client';

export default class RootConfig implements PlatformClientConfig {

  @Type(() => HttpClientConfig)
  @ValidateNested()
  public readonly platformClient!: HttpClientConfig;

}
```

### Import `PlatformClientModule` in your main module

## That's it, api clients will be available in your DI container, you can simply inject it in constructor

```typescript

import { RolesApi } from '@softkit/platform-client';

@Injectable()
export default class MyServiceThatNeedRolesApi {

  constructor(
    private readonly rolesApi: RolesApi,
  ) {}

}

```


