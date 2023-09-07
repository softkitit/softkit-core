
# Validation Wrapper around class-validator

### We need this wrapper because of few reasons: 

- class-validator is a nice library, but it's not actively supported anymore, and we consider forking it and maintaining it by ourselves. 
- there are plenty of alternatives for class-validator, but it is the most convenient one that we've ever used, and a lot of other libraries are using it as well. So having a single validator for everything is a good idea.
- class-validator stopped supporting dynamic validation schema, and in this library we implemented it for our needs and with our structures
- we also tight it with [nestjs-i18n](https://www.npmjs.com/package/@softkit/i18n), so we can easily override default translations 
- also we're providing better transformers for types like date and boolean, default class-validator transformers are not working properly with these and other types
- providing additional useful decorators like `@Match`, to check if one field match another, and other commonly requested decorators that missed in class-validator, or proper @IsEmailLocalized validator and they are localized 


### Validation rules for methods, can be found [here](https://github.com/mikeerickson/validatorjs/blob/master/src/rules.js)

### Installation

```bash
yarn add @softkit/validation
```

### Usage

Usage is as simple as with plain [class-validator](https://github.com/typestack/class-validator)

### Dynamic validator usage

- This example will throw the appropriate exception that will be handled by our filter and return RFC7807 error response if value doesn't match validator schema

```typescript
import { IsEnumValidatorDefinition, validateAndThrow } from '@softkit/validators';

validateAndThrow(
  IsEnumValidatorDefinition,
  'fieldName',
  'fieldValue',
  ['enumValue1', 'enumValue2'],
);
```

- This example will throw exception if value doesn't match constraint 

```typescript
import { MatchesRegexpValidatorDefinition, validateAndThrow } from '@softkit/validators';

const constraint = /^-?(?!0\d)\d+$/;

validateAndThrow(
  MatchesRegexpValidatorDefinition,
  params.key,
  value as string,
  constraint,
  i18nString('validation.INTEGER'),
);

```

-- If you don't need to throw exception immediately you can use `validateAndReturnError` method, that returns `ValidationError` object, that you can use later

```typescript
import { IsEnumValidatorDefinition, validateAndThrow } from '@softkit/validators';

const error = validateAndReturnError(
  IsEnumValidatorDefinition,
  'fieldName',
  'fieldValue',
  ['enumValue1', 'enumValue2'],
);

console.log(error);

```


