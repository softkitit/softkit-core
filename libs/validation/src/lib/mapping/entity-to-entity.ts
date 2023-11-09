import { plainToInstance } from 'class-transformer';
import {
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer/types/interfaces';

export function map<FROM, TO>(
  from: FROM[],
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO[];

export function map<FROM, TO>(
  from: FROM,
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO;

export function map<FROM, TO>(
  from: FROM | FROM[],
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO | TO[] {
  return plainToInstance(clazz, from, {
    ...DEFAULT_MAP_OPTIONS,
    ...options,
  });
}

export const DEFAULT_MAP_OPTIONS: ClassTransformOptions = {
  excludeExtraneousValues: true,
  exposeDefaultValues: true,
  ignoreDecorators: true,
  exposeUnsetFields: false,
};
