import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { hashPassword } from '@softkit/crypto';
import { UserProfileStatus } from '../repositories/vo/user-profile-status.enum';
import { UserProfile } from '../repositories/user-profile.entity';

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
