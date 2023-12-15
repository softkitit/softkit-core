import { applyDecorators } from '@nestjs/common';
import { ErrorResponse } from '../vo/error-response.dto';
import { ApiUnprocessableEntityResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export const ApiUnprocessableEntity = () =>
  applyDecorators(
    ApiUnprocessableEntityResponse({
      description: `Invalid or incomplete data. Unable to process the request.`,
      type: ErrorResponse,
    }),
  );
