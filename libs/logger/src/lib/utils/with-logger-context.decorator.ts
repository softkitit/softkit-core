import { Store, storage } from 'nestjs-pino/storage';
import { PinoLogger } from 'nestjs-pino';

export function WithLoggerContext() {
  return function (
    _target: any,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const methodFunc = descriptor.value as Function;
    if (!methodFunc) {
      return descriptor;
    }

    descriptor.value =
      methodFunc.constructor.name === 'AsyncFunction'
        ? async function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), async () =>
              // @ts-expect-error
              methodFunc.apply(this, args),
            );
          }
        : function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), () =>
              // @ts-expect-error
              methodFunc.apply(this, args),
            );
          };

    return descriptor;
  };
}
