# Health Check Library

This library provides a healthcheck endpoint for the application.

It's useful for kubernetes and other containerized or any environments that need healthcheck to validate that app is functioning ok.

This module is tight to Softkit ecosystem and there is no point to use it outside.

## Installation

```bash
yarn add @softkit/health-check
```

## Usage in your main app module: 


- Import HealthCheckModule and register it in imports array
- Add HealthConfig to your RootConfig class
```typescript
import { HealthConfig } from '@softkit/healthcheck';

export default class RootConfig implements PlatformClientConfig {

  @Type(() => HealthConfig)
  @ValidateNested()
  public readonly health!: HealthConfig;

}
```
- Add health config to your .env.yaml file. (*Check health config to find default and available configs*)

```yaml
health:
  disk:
    enabled: true
  db:
    enabled: true
```

- That's it health endpoint will be available at `/health` path for use. *If you have a basePath configured it also will be applied to health endpoint.*

