import { setSeederFactory } from 'typeorm-extension';
import { plainToInstance } from 'class-transformer';
import { UserProfileStatus } from '../repositories/vo/user-profile-status.enum';
import { UserProfile } from '../repositories/user-profile.entity';
import { faker } from '@faker-js/faker';
import { PickType } from '@nestjs/swagger';

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
