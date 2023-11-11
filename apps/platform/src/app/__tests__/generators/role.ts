import { CreateUserRole } from '../../controllers/roles/vo/role.dto';
import { faker } from '@faker-js/faker';

export function createRole(): CreateUserRole {
  return {
    name: faker.string.alpha(20),
    description: faker.string.alpha(200),
  };
}
