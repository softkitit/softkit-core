# Formatting

`@softkit/i18n` uses **[string-format](https://www.npmjs.com/package/string-format)** for formatting by default.

First define arguments in your translations

```json title="src/i18n/en/test.json"
{
  "HELLO": "Hello {username}"
}
```

To provide `@softkit/i18n` with the right arguments pass them down while doing the translation

```typescript
i18n.t('test.HELLO', { args: { username: 'Toon' } });
// => Hello Toon
```

:::tip
To define your own formatting function change the `formatter`. Read the instructions [here](#custom-formatter).
:::

## Array arguments

You can also use an array of arguments

```json title="src/i18n/en/test.json"
{
  "HELLO": "Hello {0.username}, This library is {1.opinion}"
}
```

```typescript
i18n.t('test.HELLO', {
  args: [{ username: 'Toon' }, { opinion: "Terrible :')" }],
});
// => Hello Toon, This library is Terrible :')
```

## Custom formatter

To use a custom formatter define the `formatter` option. This option takes a function with a `template` and `...args`.

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import * as path from 'path';
import { I18nJsonLoader, I18nModule } from '@softkit/i18n';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      formatter: (template: string, ...args: any[]) => template,
      loaders: [
        new I18nJsonLoader({
          path: path.join(__dirname, '/i18n/'),
        }),
      ],
    }),
  ],
  controllers: [],
})
export class AppModule {}
```

## Custom Error Formatter

When handling exceptions, you can utilize a custom error formatter to provide localized error messages:

```typescript
import { ArgumentsHost } from '@nestjs/common';
import { ErrorResponse, GeneralBadRequestException } from '../../index';
import { I18nContext, I18nValidationException } from '@softkit/i18n';

export function responseBodyFormatter(
  host: ArgumentsHost,
  exc: I18nValidationException,
  formattedErrors: object,
): Record<string, unknown> {
  const instance = host.switchToHttp().getRequest().requestId;
  const ctx = I18nContext.current();

  return exc instanceof GeneralBadRequestException
    ? ({
        ...exc.toErrorResponse(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse)
    : ({
        type: 'todo implement link to docs',
        title: ctx?.translate('exception.BAD_REQUEST.TITLE') || 'Bad Request',
        detail:
          ctx?.translate('exception.BAD_REQUEST.GENERAL_DETAIL') ||
          'Cannot validate inbound request body',
        status: exc.getStatus(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse);
}
```

In your controllers, you can use the custom error formatter like this:

```typescript
import { I18nValidationExceptionFilter } from '@softkit/i18n';

@Controller()
export class AppController {
  @UseFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: true,
      responseBodyFormatter,
    }),
  )
}
```
