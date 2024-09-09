import { Test } from '@nestjs/testing';
import { RolesBaseJwtPayload } from '../lib/vo/payload';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { RoleTokenAccessCheckService } from '../lib/services/role-token-access-check.service';
import { generateEmptyRolesPayload } from './generators/tokens-payload';
import { RoleCheckMode } from '../lib/decorators/role.decorator';
import { AbstractRoleAccessCheckService } from '../lib/services/role-access-check.service';
import { RoleType } from './app/controllers/vo/role-type';

describe('test role token service', () => {
  let roleCheckService: RoleTokenAccessCheckService;

  const jwtPayload: RolesBaseJwtPayload<RoleType> = generateEmptyRolesPayload();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          useClass: RoleTokenAccessCheckService,
          provide: AbstractRoleAccessCheckService,
        },
      ],
    }).compile();

    roleCheckService = module.get<RoleTokenAccessCheckService>(
      AbstractRoleAccessCheckService,
    );
  });

  test('role access check service should fail', async () => {
    await expect(
      roleCheckService.checkRoles('UNKNOWN' as RoleCheckMode, jwtPayload, [
        'any',
      ]),
    ).rejects.toBeInstanceOf(GeneralInternalServerException);
  });

  test('role access check service without roles should return false', async () => {
    const result = await roleCheckService.checkRoles(
      'UNKNOWN' as RoleCheckMode,
      jwtPayload,
      [],
    );

    expect(result).toBeFalsy();
  });
});
