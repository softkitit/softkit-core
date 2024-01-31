export * from './lib/config/i18';
export * from './lib/setup-i18n-module';
export * from './lib/utils';
/* istanbul ignore file */
export {
  I18N_LANGUAGES,
  I18N_LOADERS,
  I18N_OPTIONS,
  I18N_RESOLVER_OPTIONS,
  I18N_RESOLVERS,
  I18N_TRANSLATIONS,
} from './lib/i18n.constants';
export * from './lib/i18n.context';
export * from './lib/i18n.module';

// services
export * from './lib/services/i18n.service';

// interfaces
export * from './lib/interfaces';

// decorators
export * from './lib/decorators';

// build in resolvers
export * from './lib/resolvers';

// build in loaders
export * from './lib/loaders';

// interceptor
export * from './lib/interceptors/i18n-language.interceptor';

// filters
export * from './lib/filters/i18n-validation-exception.filter';

// middleware
export { I18nMiddleware } from './lib/middlewares/i18n.middleware';

// pipes
export * from './lib/pipes/i18n-validation.pipe';

// utils
export {
  getContextObject,
  i18nValidationErrorFactory,
  i18nValidationMessage,
} from './lib/utils';

// types
export { Path, PathValue } from './lib/types';
