import { SignUpByEmailWithTenantCreationRequest } from '../../controllers/auth/vo/sign-up.dto';
import { faker } from '@faker-js/faker';

export function successSignupDto(): SignUpByEmailWithTenantCreationRequest {
  return {
    email: faker.internet.email(),
    password: '12345Aa!',
    repeatedPassword: '12345Aa!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    companyIdentifier: faker.company.name(),
    companyName: faker.company.name(),
  };
}
