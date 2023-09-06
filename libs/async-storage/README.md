# This is a simple wrapper to setup a Cls Async Storage for NestJS


```
This is useful just for do not repeat yourself everytime, and shoudn't be used outside of Softkit ecosystem
```

## Installation

```bash
yarn add @softkit/async-storage
```

## Usage


```typescript

import { setupClsModule } from '@softkit/async-storage';

@Module({
  imports: [
    setupClsModule(),
  ]
})
export class MainAppAppModule {}


```
