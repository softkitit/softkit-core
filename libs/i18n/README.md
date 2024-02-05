# i18n library wrapper


This library is a simple wrapper based on [nestjs-i18n](https://nestjs-i18n.com/)

### It has a few additions:

- We highly encourage to use it in all apps and libraries, even if you do support only one language. The reason is simple, you can have all possible strings that your customers may see in one place, and this is awesome. Also you will be able to easily share general files across your teams if you have more than one, and your customers will have an amazing experience on your platform. Also one day you will receive a request from manager saying either we are expanding to new market or give me a list of all strings that we have in our app, and you will be able to do it in a few minutes.  
- it has a default config for i18n, to use in other apps and libraries (libraries usually can use this lib only for testing)
- default response body formatter for exceptions, to follow [RFC7807](https://www.rfc-editor.org/rfc/rfc7807#section-3.1) standard

## Installation

```bash
yarn add @softkit/i18n
```

## Setup

### Load module

```typescript
import { setupI18nModule } from '@softkit/i18n';

@Module({
  imports: [
    setupI18nModule(__dirname),
  ]
})
export class YourAppModule {}
```

### Update your RootConfig class

```typescript
import { I18nConfig } from '@softkit/i18n';

export default class RootConfig {

  @Type(() => I18nConfig)
  @ValidateNested()
  // field name doesn't matter, it only affect how you will configure it in your .env.yaml file
  public readonly i18n!: I18nConfig;

}
```

### Update your .env.yaml file

[//]: # (todo add more info about how to reference files from libraries)

Paths are relative to your app module file location

```yaml
i18:
  paths:
    - i18n/
    - ../../../libs/validation/src/lib/i18n/
    - ../../../libs/exceptions/src/lib/i18n/
```

#### nestjs-i18n has a great client for types generation. Example will generate types to generated folder, this is super useful to do not miss any property in your translations 

```bash
nestjs-i18n generate-types -t json -p ./src/lib/i18n -o ./src/lib/generated/i18n.generated.ts -w
```


#### TIP: Create utils file to use in your app, to get i18n typesafe and easy to use

```typescript
// todo replace @saas-buildkit once nestjs-i18n will be published
import {
  i18nValidationMessage,
  i18nValidationMessageString,
} from '@softkit/i18n';
import { Path } from '@softkit/i18n/dist/types';
import { I18nTranslations } from '../generated/i18n.generated';

export function i18nString(key: Path<I18nTranslations>) {
  return i18nValidationMessageString<I18nTranslations>(key);
}

export function i18n(key: Path<I18nTranslations>, args?: unknown) {
  return i18nValidationMessage<I18nTranslations>(key, args);
}
```

`This will make code cleaner and easier to read, you won't need to include types everytime when you want to use i18n`

