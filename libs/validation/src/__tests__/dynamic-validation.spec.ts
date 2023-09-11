import { validateAndReturnError } from '../lib/validators/dynamic';
import {
  IsStringIntegerValidatorDefinition,
  IsStringValidatorDefinition,
} from '../lib/validators';

describe('dynamic validation', () => {
  it('not a string dynamic validator failed', () => {
    const err = validateAndReturnError(
      IsStringValidatorDefinition,
      'number',
      1,
    );

    expect(err).toBeDefined();
  });
  it('not a string dynamic validator success', () => {
    const err = validateAndReturnError(
      IsStringIntegerValidatorDefinition,
      'numberString',
      '1',
      // eslint-disable-next-line unicorn/no-useless-undefined
      undefined,
    );

    expect(err).toBeUndefined();
  });

  it('empty string validator failed', () => {
    const err = validateAndReturnError(
      IsStringIntegerValidatorDefinition,
      'numberString',
      '',
      // eslint-disable-next-line unicorn/no-useless-undefined
      undefined,
    );

    expect(err).toBeDefined();
  });
});
