import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '../../lib/base.service';
import { TestBaseEntity } from './test-base.entity';
import { TestBaseRepository } from './test-base.repository';

@Injectable()
export class TestBaseService extends BaseEntityService<
  TestBaseEntity,
  TestBaseRepository
> {
  constructor(r: TestBaseRepository) {
    super(r);
  }

  findOneByFirstName(firstName: string): Promise<TestBaseEntity | undefined> {
    return this.findOne({
      where: {
        firstName,
      },
    });
  }

  findOneByFirstNameWithoutException(
    firstName: string,
  ): Promise<TestBaseEntity | undefined> {
    return this.findOne(
      {
        where: {
          firstName,
        },
      },
      false,
    );
  }
}
