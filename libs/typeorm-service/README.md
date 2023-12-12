# Typeorm Service Library

This library has some useful utilities for @softkit/typeorm library, that expose useful base services to use in your application.

This library is also throwing standard exceptions from @softkit/exceptions library. So interceptors can handle everything properly.

## Installation

```bash
yarn add @softkit/typeorm-service
```

## Examples:

- `BaseEntityService` - it has basic methods for creating, finding, updating, archiving, deleting entities. Simple CRUD based operations, and you can also extend it with your own methods.

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CustomUserRoleRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';
import { IsNull } from 'typeorm';

@Injectable()
export class CustomUserRoleService extends BaseEntityService<CustomUserRole, CustomUserRoleRepository> {
  constructor(repository: CustomUserRoleRepository) {
    super(repository);
  }

  @Transactional()
  async findDefaultRole() {
    return await this.repository.findOne({
      where: {
        roleType: RoleType.REGULAR_USER,
        tenantId: IsNull(),
      },
    });
  }
}
```

- `BaseTenantEntityService` - it has basic methods for creating, finding, updating, archiving, deleting tenant base entities. Simple CRUD based operations, and you can also extend it with your own methods.

```typescript
@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<CustomUserRole, CustomUserRoleTenantRepository> {
  constructor(repository: CustomUserRoleTenantRepository) {
    super(repository);
  }
}
```

Tip:

Each of these services has additional parameter in generics, after repository type, that is used for excluding auto generated types,
to keep service type safe and do not annoy you with type errors.

Example (_This will exclude 5 fields from base methods and types, because it will be populated by subscribers_):

```typescript
@Injectable()
export class CustomUserRoleTenantService extends BaseTenantEntityService<CustomUserRole, CustomUserRoleTenantRepository, Pick<CustomUserRole, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>> {
  constructor(repository: CustomUserRoleTenantRepository) {
    super(repository);
  }
}
```
