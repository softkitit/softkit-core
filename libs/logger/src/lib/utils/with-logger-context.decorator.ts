import { Store, storage } from 'nestjs-pino/storage';
import { PinoLogger } from 'nestjs-pino';

export function WithLoggerContext() {
  return function (
    _target: unknown,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const methodFunc = descriptor.value as Function;
    if (!methodFunc) {
      return descriptor;
    }

    descriptor.value =
      methodFunc.constructor.name === 'AsyncFunction'
        ? async function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), async () =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              methodFunc.apply(this, args),
            );
          }
        : function (...args: unknown[]) {
            return storage.run(new Store(PinoLogger.root.child({})), () =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              methodFunc.apply(this, args),
            );
          };

    return descriptor;
  };
}
