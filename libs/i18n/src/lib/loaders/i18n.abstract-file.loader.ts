import { I18nLoader } from './i18n.loader';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { exists, getDirectories, getFiles } from '../utils';
import { I18nTranslation } from '../interfaces';
import { I18nError } from '../i18n.error';

export interface I18nAbstractFileLoaderOptions {
  path: string;
  includeSubfolders?: boolean;
  filePattern?: string;
}

type I18nData = Record<string, unknown>;

const isI18nData = (data: unknown): data is I18nData => {
  return typeof data === 'object' && data !== null;
};

interface Translations {
  [lang: string]: I18nTranslation;
}

type I18nTranslationType = {
  [key: string]: string | I18nTranslation;
};

const isStringOrI18nTranslation = (
  value: unknown,
): value is string | I18nTranslationType => {
  return (
    typeof value === 'string' || (typeof value === 'object' && value !== null)
  );
};

export abstract class I18nAbstractFileLoader extends I18nLoader<I18nAbstractFileLoaderOptions> {
  constructor(options: I18nAbstractFileLoaderOptions) {
    super(options);
    this.options = this.sanitizeOptions(options);
  }

  async languages(): Promise<string[]> {
    return this.parseLanguages();
  }

  async load(): Promise<I18nTranslation> {
    return this.parseTranslations();
  }

  abstract formatData<T>(data: T, sourceFileName?: string): unknown;

  abstract getDefaultOptions(): Partial<I18nAbstractFileLoaderOptions>;

  protected async parseTranslations(): Promise<I18nTranslation> {
    const i18nPath = path.normalize(this.options.path + path.sep);

    const translations: Translations = {};

    const filePattern = this.options.filePattern ?? '*.json';

    if (!(await exists(i18nPath))) {
      throw new I18nError(`i18n path (${i18nPath}) cannot be found`);
    }

    if (!/\*\.[A-z]+/.test(filePattern)) {
      throw new I18nError(
        `filePattern should be formatted like: *.json, *.txt, *.custom etc`,
      );
    }

    const languages = await this.parseLanguages();

    const pattern = new RegExp('.' + filePattern.replace('.', '.'));

    const files = await [
      ...languages.map((l) => path.join(i18nPath, l)),
      i18nPath,
    ].reduce(async (f: Promise<string[]>, p: string) => {
      (await f).push(
        ...(await getFiles(
          p,
          pattern,
          this.options.includeSubfolders ?? false,
        )),
      );
      return f;
    }, Promise.resolve([]));

    for (const file of files) {
      let global = false;

      const pathParts = path
        .dirname(path.relative(i18nPath, file))
        .split(path.sep);
      const key = pathParts[0];

      if (key === '.') {
        global = true;
      }

      const source = await readFile(file, 'utf8');
      const data = this.formatData(source, file);

      const prefix = [...pathParts.slice(1), path.basename(file).split('.')[0]];
      if (isI18nData(data)) {
        for (const property of Object.keys(data)) {
          for (const lang of global ? languages : [key]) {
            translations[lang] = translations[lang] ?? {};

            const translationsProperty = data[property];
            if (global) {
              if (isStringOrI18nTranslation(translationsProperty)) {
                translations[lang][property] = translationsProperty;
              }
            } else {
              this.assignPrefixedTranslation(
                translations[lang],
                prefix,
                property,
                translationsProperty,
              );
            }
          }
        }
      }
    }

    return translations;
  }

  protected assignPrefixedTranslation(
    translations: I18nTranslation | string,
    prefix: string[],
    property: string,
    value: unknown,
  ) {
    if (typeof translations === 'string') {
      throw new TypeError('Cannot assign a prefixed translation to a string');
    }

    if (prefix.length > 0) {
      translations[prefix[0]] = translations[prefix[0]] ?? {};
      this.assignPrefixedTranslation(
        translations[prefix[0]],
        prefix.slice(1),
        property,
        value,
      );
    } else if (isStringOrI18nTranslation(value)) {
      translations[property] = value;
    }
  }

  protected async parseLanguages(): Promise<string[]> {
    const i18nPath = path.normalize(this.options.path + path.sep);
    return (await getDirectories(i18nPath)).map((dir) =>
      path.relative(i18nPath, dir),
    );
  }

  protected sanitizeOptions(options: I18nAbstractFileLoaderOptions) {
    const defaultOptions = this.getDefaultOptions();

    const normalizedPath = path.normalize(options.path + path.sep);
    const filePattern =
      options.filePattern || defaultOptions.filePattern || '*.json';

    return {
      ...defaultOptions,
      ...options,
      path: normalizedPath,
      filePattern: filePattern.startsWith('*.')
        ? filePattern
        : '*.' + filePattern,
    };
  }
}
