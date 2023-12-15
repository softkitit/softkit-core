import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ConflictEntityCreationData } from '../exceptions/vo/conflict-entity-creation.dto';
import { ErrorResponse } from '../vo/error-response.dto';
import { errorCodeSwaggerProperty } from './properties/error-code-swagger.property';

export const ApiConflictEntityCreation = (...errorCodes: string[]) =>
  applyDecorators(
    ApiExtraModels(ConflictEntityCreationData, ErrorResponse),
    ApiConflictResponse({
      description: `Can not create entity because of conflict`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(ConflictEntityCreationData),
              },
              ...errorCodeSwaggerProperty(...errorCodes),
            },
          },
        ],
      },
    }),
  );
