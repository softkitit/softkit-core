import { setSeederFactory } from 'typeorm-extension';
import { UserProfile } from '../entities';
import { plainToInstance } from 'class-transformer';
import { UserProfileStatus } from '../entities/users/types/user-profile-status.enum';
import { hashPassword } from '@softkit/crypto';

export const userProfileFactory = setSeederFactory(
  UserProfile,
  async (faker) => {
    const plainUserProfile = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      status: UserProfileStatus.ACTIVE,
      password: await hashPassword(faker.hacker.verb()),
    } satisfies Pick<
      UserProfile,
      'email' | 'firstName' | 'lastName' | 'status' | 'password'
    >;

    return plainToInstance(UserProfile, plainUserProfile);
  },
);
