/* eslint-disable no-console */
import chalk = require('chalk');

export const SK_PREFIX = chalk.inverse(chalk.bold(chalk.cyan(' SK ')));

export const SK_ERROR = chalk.inverse(chalk.bold(chalk.red(' ERROR ')));

export const logger = {
  warn: (s: unknown) => console.warn(chalk.bold(chalk.yellow(s))),
  error: (s: unknown) => {
    if (typeof s === 'string' && s.startsWith('SK ')) {
      console.error(`\n${SK_ERROR} ${chalk.bold(chalk.red(s.slice(3)))}\n`);
    } else if (s instanceof Error && s.stack) {
      console.error(chalk.bold(chalk.red(s.stack)));
    } else {
      console.error(chalk.bold(chalk.red(s)));
    }
  },
  info: (s: unknown) => {
    if (typeof s === 'string' && s.startsWith('SK ')) {
      console.info(`\n${SK_PREFIX} ${chalk.bold(s.slice(3))}\n`);
    } else {
      console.info(s);
    }
  },
  log: (...s: unknown[]) => {
    console.log(...s);
  },
  debug: (...s: unknown[]) => {
    console.debug(...s);
  },
  fatal: (...s: unknown[]) => {
    console.error(...s);
  },
  verbose: (...s: unknown[]) => {
    if (process.env['SK_VERBOSE_LOGGING']) {
      console.log(...s);
    }
  },
};

export function stripIndent(str: string): string {
  const match = str.match(/^[\t ]*(?=\S)/gm);
  if (!match) {
    return str;
  }
  const indent = match.reduce(
    (r, a) => Math.min(r, a.length),
    Number.POSITIVE_INFINITY,
  );
  const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');
  return str.replace(regex, '');
}
