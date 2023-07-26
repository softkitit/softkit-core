import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';

const DEFAULT_VALIDATION_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
};

export { DEFAULT_VALIDATION_OPTIONS };
