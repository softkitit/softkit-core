# Typeorm Utilities

This library has some useful utilities for typeorm, entities, repositories, useful subscribers, interceptors.

It can be useful outside Softkit ecosystem

## Features

- It provides a base entity that has some useful fields like `createdAt`, `updatedAt`, `deletedAt`
- It overrides the default typeorm repository, and fixes some type confuses in the default typeorm repository
- It provides a tenant base repository, that make all requests based on tenant id that must be present in `ClsStore`
- Useful subscribers for auto populate any field from ClsStore, like `tenantId`, `userId`
- Optimistic lock handler, that will throw an error if you try to update an entity that was updated by someone else
- Common interceptors for DB errors, that transforms DB errors to RFC7807 errors
- Simplify transaction management with `@Transaction` decorator

## Installation

```bash
yarn add @softkit/typeorm
```

## Usage

### Add default configuration in your root config class

```typescript
import { DbConfig } from '@softkit/typeorm';

export class RootConfig {
  @Type(() => DbConfig)
  @ValidateNested()
  public readonly db!: DbConfig;
}
```

### .env.yaml file

```yaml
db:
  type: 'postgres'
  host: 'localhost'
  port: 5432
  username: postgres
  password: postgres
  database: local-db
  synchronize: false
  dropSchema: false
  keepConnectionAlive: true
  logging: false
  ssl: false
```

### Add setup and entities to your main app module

```typescript
import { setupTypeormModule } from '@softkit/typeorm';
import * as Entities from './database/entities';

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(Entities)), setupTypeormModule()],
})
class YourAppModule {}
```

### Entities to extend from

- `EntityHelper` - with entity data for handling polymorphism
- `BaseEntityHelper` - with `id`, `createdAt`, `updatedAt`, `deletedAt` fields
- `BaseTenantEntityHelper` - useful for entities that belongs to specific tenant. It has `tenantId` field, that is auto populated for search operations on repository level

Note:

in your entity you can extend from `BaseEntityHelper` or `BaseTenantEntityHelper` or `EntityHelper` and add your fields
and also override `id` field decide what you want to use uuid or number or some other type

```typescript
class SampleEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column()
  name!: string;
}
```

### Repositories to extend from

- `BaseRepository` - extends default typeorm repository, and fixes some type confuses in the default typeorm repository
- `TenantBaseRepository` - extends `BaseRepository` and adds `tenantId` to all requests, that is taken from `ClsStore`

Note:

If your entity is Tenant Base but in some cases you want to get all data, you can just create another repository for this entity that extends `BaseRepository`.
That's ok to have multiple repositories for one entity.

#### Examples

- Plain repository

```typescript
@Injectable()
export class SampleRepository extends BaseRepository<SampleEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
  ) {
    super(SampleEntity, ds);
  }
}
```

- Tenant base repository (_it require to pass a ClsService_)

```typescript
@Injectable()
export class TenantUserRepository extends BaseTenantRepository<TenantUserEntity> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(TenantUserEntity, ds, clsService);
  }
}
```

### Subscribers

- ClsPresetSubscriber - responsible for populating any fields from ClsStore to entity beforeInsert and beforeUpdate

`It configurable via ClsPreset decorator`

```typescript
export class BaseTenantEntityHelper extends BaseEntityHelper {
  @ClsPreset<TenantClsStore>({
    clsPropertyFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  tenantId!: string;
}
```

- `OptimisticLockSubscriber` - responsible for handling optimistic lock errors. It's important to handle optimistic locks properly for many reasons.
  For example, if you have a frontend app, and some resource where users can collaborate and override each other, it's important to handle optimistic lock errors properly.
  Even if your entity can be changed by one user at a time, it's important to handle optimistic lock errors properly, because it can be changed by another service or by this user in another tab, and he just forgot about it.

### Filters

- `PostgresDbQueryFailedErrorFilter` this filter is responsible for handling low level postgres QueryFailedError, it's mapping codes to the appropriate RFC7807 errors
