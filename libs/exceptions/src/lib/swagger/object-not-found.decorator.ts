import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse } from '../vo/error-response.dto';
import { ObjectNotFoundData } from '../exceptions/vo/object-not-found.dto';

export const ApiEntityNotFound = () =>
  applyDecorators(
    ApiExtraModels(ObjectNotFoundData),
    ApiNotFoundResponse({
      description: `Entity not found or user doesn't have access to it`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              data: {
                type: 'object',
                $ref: getSchemaPath(ObjectNotFoundData),
              },
            },
          },
        ],
      },
    }),
  );
