import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse } from '../vo/error-response.dto';
import { ConflictEntityCreationData } from '../exceptions/vo/conflict-entity-creation.dto';

export const ApiConflictEntityCreation = (...errorCodes: string[]) =>
  applyDecorators(
    ApiExtraModels(ConflictEntityCreationData),
    ApiConflictResponse({
      description: `Can not create entity because of conflict`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              data: {
                type: 'object',
                $ref: getSchemaPath(ConflictEntityCreationData),
              },
              errorCode: {
                type: 'enum',
                enum: errorCodes,
                description: 'Enum representing possible error codes',
              },
            },
          },
        ],
      },
    }),
  );
