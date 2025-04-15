import { parse, printParseErrorCode } from 'jsonc-parser';
import type { ParseError, ParseOptions } from 'jsonc-parser';
import { LinesAndColumns } from 'lines-and-columns';
import { codeFrameColumns } from './code-frames';
import { Tree } from '../../service/tree';

export interface JsonParseOptions extends ParseOptions {
  /**
   * Expect JSON with javascript-style
   * @default false
   */
  expectComments?: boolean;
  /**
   * Disallow javascript-style
   * @default false
   */
  disallowComments?: boolean;

  /**
   * Allow trailing commas in the JSON content
   */
  allowTrailingComma?: boolean;
}

export interface JsonSerializeOptions {
  /**
   * the whitespaces to add as indentation to make the output more readable.
   * @default 2
   */
  spaces?: number;
}

/**
 * Parses the given JSON string and returns the object the JSON content represents.
 * By default javascript-style comments and trailing commas are allowed.
 *
 * @param input JSON content as string
 * @param options JSON parse options
 * @returns Object the JSON content represents
 */
export function parseJson<T extends object = object>(
  input: string,
  options?: JsonParseOptions,
): T {
  try {
    if (options?.expectComments !== true) {
      return JSON.parse(input);
    }
  } catch {
    /* empty */
  }

  options = { allowTrailingComma: true, ...options };

  const errors: ParseError[] = [];
  const result: T = parse(input, errors, options);

  if (errors.length > 0) {
    throw new Error(formatParseError(input, errors[0]));
  }

  return result;
}

/**
 * Nicely formats a JSON error with context
 *
 * @param input JSON content as string
 * @param parseError jsonc ParseError
 * @returns
 */
function formatParseError(input: string, parseError: ParseError) {
  const { error, offset, length } = parseError;
  const location = new LinesAndColumns(input).locationForIndex(offset);

  if (!location) {
    return printParseErrorCode(error);
  }

  let { line, column } = location;

  line++;
  column++;

  return (
    `${printParseErrorCode(error)} in JSON at ${line}:${column}\n` +
    codeFrameColumns(input, {
      start: { line, column },
      end: { line, column: column + length },
    }) +
    '\n'
  );
}

/**
 * Serializes the given data to a JSON string.
 * By default the JSON string is formatted with a 2 space indentation to be easy readable.
 *
 * @param input Object which should be serialized to JSON
 * @param options JSON serialize options
 * @returns the formatted JSON representation of the object
 */
export function serializeJson<T extends object = object>(
  input: T,
  options?: JsonSerializeOptions,
): string {
  return JSON.stringify(input, undefined, options?.spaces ?? 2);
}

/**
 * Reads a json file, removes all comments and parses JSON.
 *
 * @param tree - file system tree
 * @param path - file path
 * @param options - Optional JSON Parse Options
 */
export function readJson<T extends object = object>(
  tree: Tree,
  path: string,
  options?: JsonParseOptions,
): T {
  if (!tree.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }

  const input = tree.read(path, 'utf8');

  return parseJson(input || '', options);
}

/**
 * Writes a JSON value to the file system tree

 * @param tree File system tree
 * @param path Path of JSON file in the Tree
 * @param value Serializable value to write
 * @param options Optional JSON Serialize Options
 */
export function writeJson<T extends object = object>(
  tree: Tree,
  path: string,
  value: T,
  options?: JsonSerializeOptions,
): void {
  const serialized = serializeJson(value, options);
  tree.write(path, `${serialized}\n`);
}

/**
 * Updates a JSON value to the file system tree
 *
 * @param tree File system tree
 * @param path Path of JSON file in the Tree
 * @param updater Function that maps the current value of a JSON document to a new value to be written to the document
 * @param options Optional JSON Parse and Serialize Options
 */
export function updateJson<T extends object = object, U extends object = T>(
  tree: Tree,
  path: string,
  updater: (value: T) => U,
  options?: JsonParseOptions & JsonSerializeOptions,
): void {
  const updatedValue = updater(readJson(tree, path, options));
  writeJson(tree, path, updatedValue, options);
}
