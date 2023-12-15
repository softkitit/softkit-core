import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiBadRequestResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { BadRequestData } from '../exceptions/vo/bad-request.dto';
import { ErrorResponse } from '../vo/error-response.dto';
import { errorCodeSwaggerProperty } from './properties/error-code-swagger.property';

export const ApiBadRequest = (...errorCodes: string[]) =>
  applyDecorators(
    ApiExtraModels(BadRequestData, ErrorResponse),
    ApiBadRequestResponse({
      description: `Bad request provided by user`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(BadRequestData),
                },
              },
              ...errorCodeSwaggerProperty(...errorCodes),
            },
          },
        ],
      },
    }),
  );
