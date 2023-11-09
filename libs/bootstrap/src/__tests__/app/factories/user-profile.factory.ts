import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { UserProfileStatus } from '../repositories/vo/user-profile-status.enum';
import { UserProfile } from '../repositories/user-profile.entity';
import { faker } from '@faker-js/faker';
import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@softkit/typeorm';
import { OmittedEntity } from './vo/entity-omit.type';

export const userProfileFactory = setSeederFactory(UserProfile, async () => {
  const plainUserProfile = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    status: UserProfileStatus.ACTIVE,
  } satisfies OmittedEntity<
    UserProfile,
    typeof DEFAULT_CREATE_ENTITY_EXCLUDE_LIST
  >;

  return plainToInstance(UserProfile, plainUserProfile);
});
