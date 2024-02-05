import { I18nTranslation } from '../interfaces';

export abstract class I18nLoader<T> {
  constructor(protected options: T) {}
  abstract languages(): Promise<string[]>;
  abstract load(): Promise<I18nTranslation>;
}
