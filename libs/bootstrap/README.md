# Bootstrap Library

This library provides a set of general services, methods and utilities for bootstrapping the application.
It's configuring default interceptors, swagger, http server, security, etc...

---

Useful to do not repeat yourself everytime, and shouldn't be used outside Softkit ecosystem

---

## Installation

```bash
yarn add @softkit/bootstrap
```

## Usage in your main.ts

```typescript
import { PlatformAppModule } from './your-app.module';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';

void bootstrapBaseWebApp(PlatformAppModule);
```

---

## Usage in tests (e2e)

```typescript
import { bootstrapBaseWebApp } from '@softkit/bootstrap';

describe('auth e2e test', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [YourAppModule],
    }).compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);
  });
});
```
## Usage cookie

1. add the /// <reference types="@fastify/cookie" /> line in the global.d.ts file
2. update the tsconfig.app.json. Add the "../../global.d.ts" in the include array
3. add the cookie secret in the config file.
```json
{
  "include": [
    "../../global.d.ts"
  ]
}
```

