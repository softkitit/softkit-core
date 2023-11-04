import {
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
} from '../../lib/vo/payload';
import { faker } from '@faker-js/faker';

export function generateEmptyPermissionsPayload(): PermissionsBaseJwtPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    permissions: [],
  };
}

export function generateRefreshTokenPayload(): IRefreshTokenPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
  };
}
