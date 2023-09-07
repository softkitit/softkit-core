# Logger Library

This library is based on pino logger and provides an opinionated logger for Softkit ecosystem.

By default it logs finish request, with request id and time, and also logs all exceptions with stack trace.

In general it is a pain to fine and setup a proper logger for nestjs application.

We solved most configuration problems that we had with logging in our projects.

Also leverage the use of ClsService to have a proper request id in logs.

## Installation

```bash
yarn add @softkit/logger
```

## Usage

### Default interceptors

- **LoggingInterceptor** - it will log all incoming requests


### Default configuration

```typescript

import { setupLoggerModule } from '@softkit/logger';

@Module({
  imports: [
    setupLoggerModule(),
  ]
})
export class YourAppModule {}

```

### Update your root config class

```typescript

export class RootConfig {
  @Type(() => LoggerConfig)
  @ValidateNested()
  public readonly logger!: LoggerConfig;
}

```

### Update your config files

`.env.yaml` file

```yaml
logs:
#  useful for development as well
  colorize: true
#  info should be used for production in most cases, unless you want to debug something
  level: info
#  pretty print usually needed only for development, so must be changed in .env-${env}.yaml files for deployment
  prettyPrint: true
```





