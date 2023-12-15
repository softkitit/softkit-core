import {
  Controller,
  ForbiddenException,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GeneralNotFoundException } from '../../lib/exceptions/general-not-found.exception';
import { GeneralForbiddenException } from '../../lib/exceptions/general-forbidden.exception';
import { GeneralUnauthorizedException } from '../../lib/exceptions/general-unauthorized.exception';
import { MissingConfigurationForFeatureException } from '../../lib/exceptions/missing-configuration-for-feature.exception';
import { ObjectNotFoundException } from '../../lib/exceptions/object-not-found.exception';
import { OptimisticLockException } from '../../lib/exceptions/optimistic-lock.exception';
import { GeneralInternalServerException } from '../../lib/exceptions/general-internal-server.exception';
import { ConflictEntityCreationException } from '../../lib/exceptions/conflict-entity-creation.exception';
import { InternalServiceUnavailableHttpException } from '../../lib/exceptions/internal-service-unavailable.exception';
import {
  ApiBadRequest,
  ApiConflictEntityCreation,
  ApiForbidden,
  ApiOptimisticLock,
  ApiEntityNotFound,
} from '../../lib/swagger';
import { GeneralBadRequestException } from '../../lib/exceptions/general-bad-request.exception';
import { GeneralUnprocessableEntityException } from '../../lib/exceptions/general-unprocessable-entity.exception';
import { ErrorCodes } from './vo/error-codes.enum';

@Controller({
  path: 'failing-http',
})
export class FailingController {
  @Post('not-found')
  public async notFound() {
    throw new GeneralNotFoundException();
  }

  @ApiBadRequest()
  @Post('bad-request')
  public async badRequest() {
    throw new GeneralBadRequestException([
      {
        target: {},
        constraints: {
          isNotEmpty: 'field is required',
        },
        contexts: {},
        children: [],
        value: 'fieldValue',
        property: 'fieldName',
      },
    ]);
  }

  @ApiForbidden()
  @Post('general-forbidden')
  public async generalForbidden() {
    throw new GeneralForbiddenException();
  }

  @Post('unauthorized')
  public async unauthorized() {
    throw new GeneralUnauthorizedException();
  }

  @Post('missing-configuration-for-feature')
  public async missingConfigurationForFeature() {
    throw new MissingConfigurationForFeatureException('SAML SSO');
  }

  @ApiEntityNotFound()
  @Post('object-not-found')
  public async objectNotFound() {
    throw new ObjectNotFoundException('saml_configuration');
  }

  @ApiOptimisticLock()
  @Post('optimistic-lock')
  public async optimisticLock() {
    throw new OptimisticLockException(2);
  }

  @Post('unknown-exception-thrown')
  public async unknownExceptionThrown() {
    throw new Error('unknown exception thrown');
  }

  @Post('default-forbidden-exception')
  public async defaultForbiddenException() {
    throw new ForbiddenException();
  }

  @Post('custom-internal-server-error')
  public async customInternalServerError() {
    throw new GeneralInternalServerException();
  }

  @ApiConflictEntityCreation()
  @Post('failed-to-create-entity-thrown')
  public async failedToCreateEntityThrown() {
    throw new ConflictEntityCreationException(
      'saml_configuration_idp_metadata',
      'issuer',
      'https://idp.example.com/saml2',
    );
  }

  @Post('service-unavailable')
  public async serviceUnavailable() {
    throw new InternalServiceUnavailableHttpException('user-microservice');
  }

  @Post('healthcheck')
  public async healthcheck() {
    throw new ServiceUnavailableException();
  }

  @ApiBadRequest()
  @Post('unprocessable-entity')
  public async unprocessableEntity() {
    throw new GeneralUnprocessableEntityException(
      'This record must be active',
      undefined,
      ErrorCodes.RECORD_IS_NOT_ACTIVE,
    );
  }
}
