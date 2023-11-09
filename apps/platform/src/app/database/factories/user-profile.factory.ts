import { setSeederFactory } from 'typeorm-extension';
import { UserProfile } from '../entities';
import { plainToInstance } from 'class-transformer';
import { UserProfileStatus } from '../entities/users/types/user-profile-status.enum';
import { PickType } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

class UserProfileFactory extends PickType(UserProfile, [
  'email',
  'firstName',
  'lastName',
  'status',
]) {
  constructor() {
    super();
    this.email = faker.internet.email();
    this.firstName = faker.person.firstName();
    this.lastName = faker.person.lastName();
    this.status = UserProfileStatus.ACTIVE;
  }
}

export const userProfileFactory = setSeederFactory(UserProfile, async () => {
  const plainUserProfile = new UserProfileFactory();

  return plainToInstance(UserProfile, plainUserProfile);
});
