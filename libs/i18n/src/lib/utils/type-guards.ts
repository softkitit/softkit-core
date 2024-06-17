import { I18nOptionResolver, ResolverWithOptions } from '../interfaces';

export const isResolverWithOptions = (
  resolver: I18nOptionResolver,
): resolver is ResolverWithOptions => {
  return 'use' in resolver;
};
