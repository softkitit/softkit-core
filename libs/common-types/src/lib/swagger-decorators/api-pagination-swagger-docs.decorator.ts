import { PaginateConfig } from 'nestjs-paginate';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponsePaginated } from './api-ok-response.decorator';
import { ApiPagination } from './api-query-pagination.decorator';

export function PaginatedSwaggerDocs<DTO extends Type<unknown>>(
  dto: DTO,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginatedConfig: PaginateConfig<any>,
) {
  return applyDecorators(
    ApiOkResponsePaginated(dto, paginatedConfig),
    ApiPagination(paginatedConfig),
  );
}
