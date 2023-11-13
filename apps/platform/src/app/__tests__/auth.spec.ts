import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { wrapInTransaction } from 'typeorm-transactional';
import { BaseSignUpByEmailRequest } from '../controllers/auth/vo/sign-up.dto';
import {
  ExternalApprovalService,
  SignupService,
  TenantService,
  UserService,
} from '../services';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { SignInRequest } from '../controllers/auth/vo/sign-in.dto';
import { ApproveSignUpRequest } from '../controllers/auth/vo/approve.dto';
import { successSignupDto } from './generators/signup';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';

const signUpDto: BaseSignUpByEmailRequest = successSignupDto();

describe('auth e2e test', () => {
  let app: NestFastifyApplication;
  let approvalService: ExternalApprovalService;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    signUpDto.email = faker.internet.email({
      provider: 'gmail' + faker.string.alphanumeric(10).toString() + '.com',
    });

    const { PlatformAppModule } = require('../platform-app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(SignupService)
      .compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    approvalService = app.get(ExternalApprovalService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successful signup', async () => {
      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: signUpDto,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).message).toBeDefined();
    });

    it('should properly rollback with failing on approval creation', async () => {
      jest
        .spyOn(app.get(ExternalApprovalService), 'createOrUpdateEntity')
        .mockImplementation(async (_entity) => {
          throw new Error('unexpected error');
        });

      const tenantsBeforeSignUp = await app.get(TenantService).findAll();
      const tenantsCountBeforeSignUp = tenantsBeforeSignUp.length;

      const usersBeforeSignUp = await app.get(UserService).findAll();
      const usersCountBeforeSignUp = usersBeforeSignUp.length;

      const approvalsBeforeSignUp = await app
        .get(ExternalApprovalService)
        .findAll();

      const approvalsCountBeforeSignUp = approvalsBeforeSignUp.length;

      await wrapInTransaction(async () => {
        const response = await app.inject({
          method: 'POST',
          url: 'api/platform/v1/auth/signup',
          payload: signUpDto,
        });

        // counts of all of these entities should remain the same after failed signup

        const users = await app.get(UserService).findAll();
        expect(users.length).toBe(usersCountBeforeSignUp);

        const allTenants = await app.get(TenantService).findAll();
        expect(allTenants.length).toBe(tenantsCountBeforeSignUp);

        const allApprovals = await app.get(ExternalApprovalService).findAll();
        expect(allApprovals.length).toBe(approvalsCountBeforeSignUp);

        expect(response.statusCode).toBe(500);
      });
    });

    it('should fail on second signup with same email', async () => {
      await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: signUpDto,
      });

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: signUpDto,
      });

      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it.each([
      {
        requestBody: {
          ...signUpDto,
          email: 'invalid email',
        },
        invalidFields: ['email'],
      },
      {
        requestBody: {
          ...signUpDto,
          email: null,
        },
        invalidFields: ['email'],
      },
      {
        requestBody: {
          ...signUpDto,
          password: '123123123',
        },
        invalidFields: ['password', 'repeatedPassword'],
      },
      {
        requestBody: {
          ...signUpDto,
          repeatedPassword: '123123123&Aa',
        },
        invalidFields: ['repeatedPassword'],
      },
      {
        requestBody: {
          ...signUpDto,
          firstName: faker.string.alphanumeric(320),
        },
        invalidFields: ['firstName'],
      },
    ])('validation exceptions signup %p', async (data) => {
      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: data.requestBody,
      });

      expect(response.statusCode).toBe(400);
      const responseBodyObj = JSON.parse(response.body);

      expect(responseBodyObj.title.length).toBeGreaterThan(0);
      expect(responseBodyObj.detail.length).toBeGreaterThan(0);
      expect(responseBodyObj.status).toBe(400);
      expect(responseBodyObj.data.length).toBe(data.invalidFields.length);

      for (const invalidField of responseBodyObj.data) {
        expect(data.invalidFields.includes(invalidField.property)).toBeTruthy();
        const constraintMessages = Object.values(
          invalidField.constraints,
        ) as string[];

        for (const message of constraintMessages) {
          expect(message.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('sign in', () => {
    it('should return a 401 error if the credentials are incorrect', async () => {
      const email = 'test@example.com';
      const password = '123456a!4';

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signin',
        payload: { email, password } satisfies SignInRequest,
      });

      expect(response.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('status', HttpStatus.UNAUTHORIZED);
    });
    it('successful sign in', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: signUpDto,
      });

      expect(signUpResponse.statusCode).toBe(201);

      const approvals = await approvalService.findAll();
      expect(approvals.length).toBe(1);

      const approvalObject = approvals[0];

      await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/approve-signup',
        payload: {
          id: approvalObject.id,
          code: approvalObject.code,
        } as ApproveSignUpRequest,
      });

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signin',
        payload: {
          email: signUpDto.email,
          password: signUpDto.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();

      expect(body.data.accessToken).not.toBe(body.data.refreshToken);
    });
  });

  describe('approve signup', () => {
    it('should successfully approve signup', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: {
          ...signUpDto,
          email: faker.internet.email(),
        },
      });

      expect(signUpResponse.statusCode).toBe(201);
      const approvals = await approvalService.findAll();
      expect(approvals.length).toBe(1);

      const approvalObject = approvals[0];

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/approve-signup',
        payload: {
          id: approvalObject.id,
          code: approvalObject.code,
        } as ApproveSignUpRequest,
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 404 one approve signup with unknown id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/approve-signup',
        payload: {
          id: faker.string.uuid(),
          code: faker.string.alphanumeric(6),
        } as ApproveSignUpRequest,
      });

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 404 on valid id but invalid code', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signup',
        payload: signUpDto,
      });

      expect(signUpResponse.statusCode).toBe(201);
      const approvals = await approvalService.findAll();
      expect(approvals.length).toBe(1);

      const approvalObject = approvals[0];

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/approve-signup',
        payload: {
          id: approvalObject.id,
          code: faker.string.alphanumeric(6),
        } as ApproveSignUpRequest,
      });

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
