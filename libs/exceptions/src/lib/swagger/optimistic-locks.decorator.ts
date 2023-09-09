import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse } from '../vo/error-response.dto';
import { OptimisticLockData } from '../exceptions/vo/optimistic-lock.dto';

export const ApiOptimisticLock = () =>
  applyDecorators(
    ApiExtraModels(OptimisticLockData),
    ApiConflictResponse({
      description: `Optimistic lock error occurred, someone else has updated the entity`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) },
          {
            properties: {
              data: {
                type: 'object',
                $ref: getSchemaPath(OptimisticLockData),
              },
            },
          },
        ],
      },
    }),
  );
