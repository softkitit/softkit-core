# Config Library

This library provides a set of general services and utilities for configuration.
It can be used outside Softkit projects


This library is based on [nestjs-config](https://github.com/Nikaple/nest-typed-config)
All main work is done in parent library, this one is just a wrapper to make it easier to use

---

## Installation

```bash
yarn add @softkit/config
```

---

## Usage

```typescript
import { setupYamlBaseConfigModule } from '@softkit/config';


@Module({
  imports: [
    setupYamlBaseConfigModule(path.join(__dirname, './assets'), RootConfig),
  ]
})
export class YourAppModule {}


```

---

`./assets` - is a folder where you have your config files. Above example is for such code structure:


```bash                                                                        git(docs/readme_for_each_module↑1|✚1…1 
.
├── assets
│     ├── .env-test.yaml
│     └── .env.yaml
├── config
│     └── root.config.ts
└── your-app.module.ts
```

---


## This wrapper has a few additions: 

- It has *PROFILES* feature, so you can have different configs for different environments.
  - NESTJS_PROFILES - is an environment variable, which is used to define which profile to use
  - By default, it's no profiles and only main provided file name will be used
  - The order of profiles is important it defines how to merge configs in case if there will be any conflicts
  - Example: 
    - `NESTJS_PROFILES=dev,local` - will use `.env-dev.yaml` and `.env-local.yaml` files and base `.env.yaml`
    - `NESTJS_PROFILES=dev` - will use only `.env-dev.yaml` file and base `.env.yaml`
  - By default, we recommend to set in jest config a test profile. In jest.preset.js
  ```javascript
     process.env.NESTJS_PROFILES = 'test';
  ```
- Another adjustments is adding a general alias for RootConfig class, so we can reuse it across various apps in the same way.
  - To inject a config in another library you just need to use common token `ROOT_CONFIG_ALIAS_TOKEN`
  - We leverage NestJS DI use existing feature to provide a config in a common way
      ```typescript
      {
        provide: ROOT_CONFIG_ALIAS_TOKEN,
        useExisting: rootSchemaClass,
      }
      ```
  - In your library you can expect this Provider be available globally, and you can force this config to implement your interface. So you will be able to decouple application very well, and declarative define what config you need to use in your library.
    - Example in your library:
      ```typescript
      import { Inject, Injectable } from '@nestjs/common';
      import { ROOT_CONFIG_ALIAS_TOKEN, RootConfig } from '@softkit/config';
      import { YourConfigInterface } from './your-config.interface';
      
      @Injectable()
      export class YourService {
        constructor(
          @Inject(ROOT_CONFIG_ALIAS_TOKEN)
          private readonly config: YourConfigInterface,
        ) {}
      
        getYourConfig(): YourConfigInterface {
          return this.config.yourConfig;
        }
      }
      ```
