import { applyDecorators } from '@nestjs/common';
import { ErrorResponse } from '../vo/error-response.dto';
import { ApiUnprocessableEntityResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { errorCodeSwaggerProperty } from './properties/error-code-swagger.property';

export const ApiUnprocessableEntity = (...errorCodes: string[]) =>
  applyDecorators(
    ApiExtraModels(ErrorResponse),
    ApiUnprocessableEntityResponse({
      description: `Invalid or incomplete data. Unable to process the request.`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              ...errorCodeSwaggerProperty(...errorCodes),
            },
          },
        ],
      },
    }),
  );
