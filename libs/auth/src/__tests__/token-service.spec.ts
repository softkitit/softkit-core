import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthConfig } from '../lib/config/auth';
import { JwtPayload } from '../lib/vo/payload';
import { TokenService } from '../lib/services/token.service';
import { AuthConfigMock } from './utils/auth-config.mock';
import { GeneralUnauthorizedException } from '@softkit/exceptions';

describe('test token service', () => {
  let tokenService: TokenService;

  const sampleJwtPayload: JwtPayload = {
    sub: 'userid',
    email: 'someemail',
    roles: [],
    permissions: [],
    tenantId: 'tenant',
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        TokenService,
        JwtService,
        {
          useClass: AuthConfigMock,
          provide: AuthConfig,
        },
      ],
    }).compile();

    tokenService = module.get(TokenService);
  });

  test('generate access and refresh token', async () => {
    const tokens = await tokenService.signTokens(sampleJwtPayload);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  test('generate and verify access token', async () => {
    const tokens = await tokenService.signTokens(sampleJwtPayload);

    const tokenVerification = await tokenService.verifyAccessToken(
      tokens.accessToken,
    );
    expect(tokenVerification).toBeDefined();
    expect(tokenVerification.exp).toBeDefined();
    // 15 minutes
    expect((tokenVerification.exp - tokenVerification.iat) / 60).toBe(15);

    // should be 15 minutes time
    expect(tokenVerification.exp - Date.now() / 1000).toBeGreaterThan(
      15 * 60 - 30,
    );
    // should be before now
    expect(tokenVerification.iat - Date.now() / 1000).toBeLessThan(0);
  });

  test('check for token size less than 7kb', async () => {
    const permissions = [...Array.from({ length: 400 }).keys()].map((id) => {
      // if the naming strategy will be like this, we will be able to have 400 enabled permissions per user
      return `a.u.c-${id}`;
    });

    const tokens = await tokenService.signTokens({
      ...sampleJwtPayload,
      permissions,
    });

    expect(tokens.accessToken.length).toBeLessThan(7168);
  });

  test('check for token size more than 8kb', async () => {
    const permissions = [...Array.from({ length: 1000 }).keys()].map((id) => {
      return `a.u.c-${id}`;
    });

    const tokens = await tokenService.signTokens({
      ...sampleJwtPayload,
      permissions,
    });

    expect(tokens.accessToken.length).toBeGreaterThan(7168);
  });

  test('generate and verify refresh token', async () => {
    const tokens = await tokenService.signTokens(sampleJwtPayload);

    const tokenVerification = await tokenService.verifyRefreshToken(
      tokens.refreshToken,
    );
    expect(tokenVerification).toBeDefined();
    expect(tokenVerification.exp).toBeDefined();
    // 30 days
    expect((tokenVerification.exp - tokenVerification.iat) / 60).toBe(
      60 * 24 * 30,
    );

    // should be about 30 days
    expect(tokenVerification.exp - Date.now() / 1000).toBeGreaterThan(
      60 * 24 * 30 - 30,
    );
    // should be before now
    expect(tokenVerification.iat - Date.now() / 1000).toBeLessThan(0);
  });

  test('verify access token with refresh secret', async () => {
    const tokens = await tokenService.signTokens(sampleJwtPayload);

    await expect(
      tokenService.verifyAccessToken(tokens.refreshToken),
    ).rejects.toBeInstanceOf(GeneralUnauthorizedException);
  });
});
