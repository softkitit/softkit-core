/* eslint-disable no-console */
import chalk = require('chalk');
import { EOL } from 'node:os';
import { DOCS_BASE_URL, Slug } from './slug';
import { isVerbose } from '../env';
import { isCI } from '../is-ci';

export const SK_ERROR = chalk.inverse(chalk.bold(chalk.red(' ERROR ')));

function writeToStdOut(str: string) {
  process.stdout.write(str);
}

function writeOutputTitle({
  color,
  title,
}: {
  color: Color;
  title: string;
}): void {
  writeToStdOut(`${applySkPrefix(title, color)}${EOL}`);
}

function writeOptionalOutputBody(bodyLines?: string[]): void {
  if (!bodyLines) {
    return;
  }
  addNewline();
  for (const bodyLine of bodyLines) writeToStdOut(`${bodyLine}${EOL}`);
}

function addNewline() {
  writeToStdOut(EOL);
}

const colors = {
  gray: chalk.gray,
  green: chalk.green,
  red: chalk.red,
  cyan: chalk.cyan,
  white: chalk.white,
  yellow: chalk.yellow,
  orange: chalk.hex('#F86B00'),
};

type Color = keyof typeof colors;

const cliName = 'SK';

function applySkPrefix(text: string, c: Color = 'orange'): string {
  const skPrefix = colors[c].inverse.bold(` ${cliName} `);

  return `${skPrefix}  ${text}`;
}

export class Logger {
  warn(s: string | { title: string; bodyLines?: string[] }) {
    this.log(s, true, 'yellow');
  }
  error(
    s:
      | string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | any
      | Error
      | {
          title: string;
          slug?: Slug;
          bodyLines?: string[];
        },
  ) {
    addNewline();

    writeOutputTitle({
      color: 'red',
      title: chalk.red(
        s instanceof Error
          ? s.message
          : typeof s !== 'string' && 'title' in s
          ? s.title
          : // eslint-disable-next-line unicorn/no-nested-ternary
          typeof s === 'string'
          ? s
          : JSON.stringify(s),
      ),
    });

    if (typeof s !== 'string' && !(s instanceof Error) && 'bodyLines' in s) {
      writeOptionalOutputBody(s.bodyLines);
    }

    if (typeof s !== 'string' && s instanceof Error && s.stack) {
      writeOptionalOutputBody([s.stack]);
    }

    if (typeof s !== 'string' && !(s instanceof Error) && 'slug' in s) {
      addNewline();

      writeToStdOut(
        `${chalk.grey('Learn more about this error: ')}${DOCS_BASE_URL}/${
          s.slug
        }${EOL}`,
      );
    }

    addNewline();
  }

  info(s: string | { title: string; bodyLines?: string[] }) {
    this.log(s);
  }

  log(
    s: string | { title: string; bodyLines?: string[] },
    colorText: boolean = false,
    color?: Color,
  ) {
    addNewline();

    const titleText = typeof s === 'string' ? s : s.title;

    writeOutputTitle({
      color: color ?? 'orange',
      title: color && colorText ? colors[color](titleText) : titleText,
    });

    if (typeof s !== 'string' && s.bodyLines) {
      writeOptionalOutputBody(s.bodyLines);
    }

    addNewline();
  }

  debug(s: string | { title: string; bodyLines?: string[] }) {
    this.log(s, false, 'gray');
  }

  verbose(s: string | { title: string; bodyLines?: string[] }) {
    if (isVerbose()) {
      this.log(s, false, 'gray');
    }
  }

  drain(): Promise<void> {
    return new Promise((resolve) => {
      if (process.stdout.writableNeedDrain) {
        process.stdout.once('drain', resolve);
      } else {
        resolve();
      }
    });
  }
}

/**
 * Automatically disable styling applied by chalk if CI=true
 */
if (isCI()) {
  chalk.level = 0;
}

export const logger = new Logger();
