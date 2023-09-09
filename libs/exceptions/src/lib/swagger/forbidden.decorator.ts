import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { ErrorResponse } from '../vo/error-response.dto';

export const ApiForbidden = () =>
  applyDecorators(
    ApiForbiddenResponse({
      description: `Access is forbidden`,
      type: ErrorResponse,
    }),
  );
