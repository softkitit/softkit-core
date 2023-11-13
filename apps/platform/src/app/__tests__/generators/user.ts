import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ExternalApprovalService, TenantService } from '../../services';
import { ApproveSignUpRequest } from '../../controllers/auth/vo/approve.dto';
import { SignInRequest } from '../../controllers/auth/vo/sign-in.dto';
import { successSignupDto } from './signup';

export async function registerTenant(app: NestFastifyApplication) {
  const signUpDto = successSignupDto();

  const tenantService = app.get<TenantService>(TenantService);
  const approvalService = app.get<ExternalApprovalService>(
    ExternalApprovalService,
  );

  const signUpResponse = await app.inject({
    method: 'POST',
    url: 'api/platform/v1/auth/tenant-signup',
    payload: signUpDto,
  });

  const approval = await approvalService.findOne({
    where: {
      id: signUpResponse.json().data.approvalId,
    },
  });

  await app.inject({
    method: 'POST',
    url: 'api/platform/v1/auth/approve-signup',
    payload: {
      id: approval.id,
      code: approval.code,
    } as ApproveSignUpRequest,
  });

  const token = await app.inject({
    method: 'POST',
    url: 'api/platform/v1/auth/signin',
    payload: {
      email: signUpDto.email,
      password: signUpDto.password,
    } satisfies SignInRequest,
  });

  const accessToken = token.json().data.accessToken;

  const tenant = await tenantService.findOne({
    where: {
      tenantFriendlyIdentifier: signUpDto.companyIdentifier,
    },
  });

  return {
    adminAccessToken: accessToken,
    tenant,
  };
}
