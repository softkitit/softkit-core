---
sidebar_position: 1
---

# Type safety

`@softkit/i18n` can generate types! This way your translations will be completely type safe! 🎉

# Types Generator

To facilitate internationalization in your project, `@softkit/i18n` provides a powerful CLI generator. It allows you to create types dynamically which ensures type safety for your translation keys.

Below is how you can configure `@softkit/i18n` for your project:

```typescript title="i18n-options.ts"
import { I18nJsonLoader, I18nOptions } from '@softkit/i18n';
import * as path from 'path';

export const i18nOptions: I18nOptions = {
  fallbackLanguage: 'en',
  loaders: [
    new I18nJsonLoader({
      path: path.join(__dirname, '/i18n/'),
    }),
  ],
};
```

Utilize the [`i18nOptions`](/api/i18n/src/interfaces/I18nOptions/) in your module like this:

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import { I18nModule } from '@softkit/i18n';
import { i18nOptions } from './i18n-options';

@Module({
  imports: [I18nModule.forRoot(i18nOptions)],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Also, update your `package.json` to include the `i18n` configuration and scripts to generate types:

```json title="package.json"
{
  "scripts": {
    "generate-types": "ts-node --project ./tsconfig.app.json ../../node_modules/@softkit/i18n/src/lib/cli.js generate-types -w",
    "generate": "i18n generate-types -w -t json -p ./src/app/i18n/"
  },
  "i18n": {
    "typesOutputPath": "./src/generated/i18n.generated.ts",
    "optionsFile": "./src/app/i18n-options.ts"
  }
}
```

# Usage

To use the types within your code import the `I18nTranslations` type from the generated file. Pass this type into the generic type properties of the `I18nContext` or `I18nService`.

```typescript title="src/app.controller.ts"
import { Controller, Get } from '@nestjs/common';
import { I18n, I18nContext } from '@softkit/i18n';
import { I18nTranslations } from './generated/i18n.generated.ts';

@Controller()
export class AppController {
  @Get()
  async getHello(@I18n() i18n: I18nContext<I18nTranslations>) {
    return await i18n.t('test.HELLO');
  }
}
```

:::tip
You can import the `I18nPath` type so you require a valid i18n path in your code. This is useful when handeling exceptions with translations.

```typescript title="src/app.controller.ts"
import { I18nPath } from './generated/i18n.generated.ts';

export class ApiException extends Error {
  get translation(): I18nPath {
    return this.message as I18nPath;
  }

  get args(): any {
    return this._args;
  }

  constructor(
    key: I18nPath,
    private readonly _args?: any,
  ) {
    super(key);
  }
}
```

:::

:::caution
For now type safety is optional and need to be enabled. We're planning to make a breaking change where type safety is enabled by default.
:::

# Type safety with DTOS

You can also use the generated types in your DTOs. This way you can reduce the chance of having a typo in your validation messages.

```typescript title="src/craete-user.dto.ts"
import { I18nTranslations } from './generated/i18n.generated.ts';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from '@softkit/i18n';

export class CreateUserDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.isNotEmpty'),
  })
  @IsEmail(
    {},
    { message: i18nValidationMessage<I18nTranslations>('validation.isEmail') },
  )
  email: string;

  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.isNotEmpty'),
  })
  password: string;
}
```
