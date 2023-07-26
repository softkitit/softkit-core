import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { InfinityPaginationResultType } from '../../';

export const ApiOkResponsePaginated = <DTO extends Type<unknown>>(
  dataDto: DTO,
) =>
  applyDecorators(
    ApiExtraModels(InfinityPaginationResultType, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(InfinityPaginationResultType) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );
