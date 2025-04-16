Softkit Core Libraries Changelog
## [0.6.1](https://github.com/softkitit/softkit-core/compare/typeorm-0.6.0...typeorm-0.6.1) (2025-04-16)


### Bug Fixes

* **test-utils:** sonar fixes ([4fe02d8](https://github.com/softkitit/softkit-core/commit/4fe02d8857ec0055e500e1e4db1575548211198b))
* **typeorm:** decreased the version of nestjs-paginate dependency to support more versions ([ece2072](https://github.com/softkitit/softkit-core/commit/ece20725ab1551279f587c5cbf05c3ad9e516503))
* **typeorm:** fixed type definition for docs generation ([f7b49c4](https://github.com/softkitit/softkit-core/commit/f7b49c4324255da58d1591af32e7ce23d533b7ba))

## [0.6.0](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.5...typeorm-0.6.0) (2024-07-29)


### Features

* **persistence-api:** added base persistence-api for backward compatibility ([fd3d0b9](https://github.com/softkitit/softkit-core/commit/fd3d0b944ecbcecdcc389c52e9227202e16d613e))
* **typeorm:** updated repository abstraction to use new persistence-api layer ([a005b62](https://github.com/softkitit/softkit-core/commit/a005b6228b3a7c17cfe54d42cc4c128f6199af5c))


### Bug Fixes

* **typeorm:** sonar fixes ([b650b50](https://github.com/softkitit/softkit-core/commit/b650b50edcdb550e027b55b1ffd5b76a1a9517ff))

## [0.5.5](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.4...typeorm-0.5.5) (2024-07-16)


### Bug Fixes

* **typeorm:** update usage of @ValidateNested decorator ([cb24bc3](https://github.com/softkitit/softkit-core/commit/cb24bc38a1962b6e3c1a4eeca000e0e19ce1b10f))

## [0.5.4](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.3...typeorm-0.5.4) (2024-07-08)

## [0.5.3](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.2...typeorm-0.5.3) (2024-02-05)


### Bug Fixes

* **typeorm:** removed dependency on saas-buildkit/i18n library ([202dd56](https://github.com/softkitit/softkit-core/commit/202dd56f179c5ee944fae785ea685dc712334903))

## [0.5.2](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.1...typeorm-0.5.2) (2024-01-26)

## [0.5.1](https://github.com/softkitit/softkit-core/compare/typeorm-0.5.0...typeorm-0.5.1) (2024-01-26)

## [0.5.0](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.13...typeorm-0.5.0) (2024-01-24)


### Features

* **jobs:** automated bull jobs creation and auto queue registrations, introduced one connection by queue by default ([7ceedaa](https://github.com/softkitit/softkit-core/commit/7ceedaad2a1f875e282880899b93453108ba3d68))
* **typeorm:** made version field optional, get rid of default id field in base entity, extended base repositories to pass needed information about id field, and added example with versions ([5655c17](https://github.com/softkitit/softkit-core/commit/5655c170adeb19162b7d14b36134464b8208c9d7))


### Bug Fixes

* **typeorm:** fixed paginate default logic with updated version of nestjs paginate ([dd6cf94](https://github.com/softkitit/softkit-core/commit/dd6cf94ab330ca9edde61454b8ee6461b57ff136))


### Reverts

* Revert "test(typeorm): removed unneeded test for internals of paginate" ([2f35ff9](https://github.com/softkitit/softkit-core/commit/2f35ff9944e2a20774ce64b8c0feb34c27b18951))

## [0.4.13](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.12...typeorm-0.4.13) (2023-12-15)


### Bug Fixes

* **typeorm:** update readme ([c5853e6](https://github.com/softkitit/softkit-core/commit/c5853e64197bd2cd46590f39f2b9344ffbab566b))

## [0.4.12](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.11...typeorm-0.4.12) (2023-12-15)


### Bug Fixes

* **typeorm:** remove ApiProperty decorator to generate correct id types ([364d1c1](https://github.com/softkitit/softkit-core/commit/364d1c1b03688df4538f4048d967fc3097f39ed7))

## [0.4.11](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.10...typeorm-0.4.11) (2023-12-11)


### Bug Fixes

* **typeorm:** fixed paginate default logic with updated version of nestjs paginate ([62fca07](https://github.com/softkitit/softkit-core/commit/62fca07434aebd78702b9d3d1897c2ea97ea05fe))

## [0.4.10](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.9...typeorm-0.4.10) (2023-11-30)


### Bug Fixes

* **typeorm:** updated the cls preset subscriber, added skip if an entity does not exist to the before update method ([9cce2e0](https://github.com/softkitit/softkit-core/commit/9cce2e0eb19fcf0b9419e0b6ccdb82ef710586b2))

## [0.4.9](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.8...typeorm-0.4.9) (2023-11-27)


### Bug Fixes

* **typeorm:** fixed a path to configs ([5ebafe3](https://github.com/softkitit/softkit-core/commit/5ebafe3387f06e050d3373d0495ec76206c4d1f3))

## [0.4.8](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.7...typeorm-0.4.8) (2023-11-27)


### Bug Fixes

* **typeorm:** updated the migration data source ([77207f5](https://github.com/softkitit/softkit-core/commit/77207f56d20e7c078927b61de5c61c4ff9990251))
* **typeorm:** updated the migration data source ([2411e3c](https://github.com/softkitit/softkit-core/commit/2411e3ccea62755c3d5585df2240f3cbcd817801))

## [0.4.7](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.6...typeorm-0.4.7) (2023-11-24)


### Bug Fixes

* **typeorm:** updated the data source config ([90ce4b6](https://github.com/softkitit/softkit-core/commit/90ce4b6a97475f7066d91d9ca41d0e8bcadea6a4))

## [0.4.6](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.5...typeorm-0.4.6) (2023-11-22)


### Bug Fixes

* **typeorm:** updated the db extra settings ([2636d91](https://github.com/softkitit/softkit-core/commit/2636d913d29a7d4ae756f64ee10b73edbfd83ec2))

## [0.4.5](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.4...typeorm-0.4.5) (2023-11-21)


### Bug Fixes

* **typeorm:** added back nest-typed-config ([14b9cc4](https://github.com/softkitit/softkit-core/commit/14b9cc44c38e344c6b6a6e64b624ddbe69a3194c))
* **typeorm:** removed unnecessary dependency on nest-typed-config ([508db00](https://github.com/softkitit/softkit-core/commit/508db0082333aa97218ea9e2df3d0d9d8a1f9786))

## [0.4.4](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.3...typeorm-0.4.4) (2023-11-19)


### Bug Fixes

* **typeorm:** added more properties to DBConfig ([84d55d1](https://github.com/softkitit/softkit-core/commit/84d55d1f609ddce0e58bf226b879e958e5d42801))
* **typeorm:** added nest-typed-config to deps for migrations ([d0bca70](https://github.com/softkitit/softkit-core/commit/d0bca70799ee983d475f4a73f696529a0e6bd79f))

## [0.4.3](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.2...typeorm-0.4.3) (2023-11-16)


### Bug Fixes

* **typeorm:** updated the migration data source config to exclude the index.ts to fix the reverting migrations ([ee2ee52](https://github.com/softkitit/softkit-core/commit/ee2ee524aa9f618bd56970298cdc0106e211415e))

## [0.4.2](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.1...typeorm-0.4.2) (2023-11-15)

## [0.4.1](https://github.com/softkitit/softkit-core/compare/typeorm-0.4.0...typeorm-0.4.1) (2023-11-13)


### Bug Fixes

* **typeorm:** added expose tenant id for the default base tenant entity ([df626b1](https://github.com/softkitit/softkit-core/commit/df626b1db086b34678ed2c4524d10266e0cc3187))
* **typeorm:** fixed DEFAULT_UPDATE lists, fixes for the cls subscriber, extended DbConfig to include more options ([ef28526](https://github.com/softkitit/softkit-core/commit/ef285265cd0f2c7e2a69ba8f1868d629317da503))

## [0.4.0](https://github.com/softkitit/softkit-core/compare/typeorm-0.3.1...typeorm-0.4.0) (2023-11-09)


### Features

* **typeorm:** add runSeeds flag for enabling database seeders and tokens ([41010d8](https://github.com/softkitit/softkit-core/commit/41010d8d96c9a7dfba5615e666d3ba2c33b2d05a))

## [0.3.1](https://github.com/softkitit/softkit-core/compare/typeorm-0.3.0...typeorm-0.3.1) (2023-11-08)


### Bug Fixes

* **typeorm:** added ability to pass a list of migration functions/classes instead of files ([7286382](https://github.com/softkitit/softkit-core/commit/7286382283ed16f5ed677ab259ae12f7995765c5))

## [0.3.0](https://github.com/softkitit/softkit-core/compare/typeorm-0.2.1...typeorm-0.3.0) (2023-11-04)


### Features

* **typeorm:** added default exclusion lists for DTOs ([be304fb](https://github.com/softkitit/softkit-core/commit/be304fbebf4015cd0edc8123b3832d17b1882361))


### Bug Fixes

* **typeorm:** added proper handling for tenant id resolution in a preset condition ([c403fb5](https://github.com/softkitit/softkit-core/commit/c403fb5dc5ba6923d755bd583d5f41fb8fc31f34))
* **typeorm:** changed default tenant entity index. Made cls service protected to have access in parent repos ([12acee5](https://github.com/softkitit/softkit-core/commit/12acee550ea2156b5caed9f110b7fb562b5b8a94))

## [0.3.0](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.2.1...typeorm-0.3.0) (2023-11-04)


### Features

* **typeorm:** added default exclusion lists for DTOs ([be304fb](https://github.com/saas-buildkit/saas-buildkit-core/commit/be304fbebf4015cd0edc8123b3832d17b1882361))


### Bug Fixes

* **typeorm:** added proper handling for tenant id resolution in a preset condition ([c403fb5](https://github.com/saas-buildkit/saas-buildkit-core/commit/c403fb5dc5ba6923d755bd583d5f41fb8fc31f34))
* **typeorm:** changed default tenant entity index. Made cls service protected to have access in parent repos ([12acee5](https://github.com/saas-buildkit/saas-buildkit-core/commit/12acee550ea2156b5caed9f110b7fb562b5b8a94))

## [0.2.1](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.2.0...typeorm-0.2.1) (2023-09-13)


### Bug Fixes

* **resource-plugin:** fixed app and services generation ([80d3907](https://github.com/saas-buildkit/saas-buildkit-core/commit/80d3907881ca244e96aa017c8c9a3a83b2c132aa))
* **resource-plugin:** library generator improvement after usability testing ([361d117](https://github.com/saas-buildkit/saas-buildkit-core/commit/361d1179595e2a8c110c65a294aa6236bb7b9c10))

## [0.2.0](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.1.0...typeorm-0.2.0) (2023-09-11)


### Features

* **typeorm:** added transforms for db config, to use env variables substitution. Updated tests to use new test-utils methods ([43a52dd](https://github.com/saas-buildkit/saas-buildkit-core/commit/43a52dde686598afd0e8b0f5680856c3121f754d))

## [0.1.0](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.0.5...typeorm-0.1.0) (2023-09-09)


### Features

* **exceptions:** added swagger annotations for all exceptions in module ([c39b916](https://github.com/saas-buildkit/saas-buildkit-core/commit/c39b9160b7606d4c66dcb53fbb2b00beaa472959))

## [0.0.5](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.0.4...typeorm-0.0.5) (2023-09-08)


### Bug Fixes

* get rid of deprecated nx updateBuildableProjectDepsInPackageJson , configured nx-dependency check lint role instead ([9093be8](https://github.com/saas-buildkit/saas-buildkit-core/commit/9093be892fd5f71629a6c22388e12432dacefdec))
* **resource-plugin:** get of rid publish script and publish capabilities in each lib, because it handled by others ([6406664](https://github.com/saas-buildkit/saas-buildkit-core/commit/64066640d13cfc6bf4e16055349265015d7bcd12))

## [0.0.4](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.0.3...typeorm-0.0.4) (2023-09-07)

### Dependency Updates

* `test-utils` updated to version `0.0.4`
* `exceptions` updated to version `0.0.4`
* `string-utils` updated to version `0.0.4`
## [0.0.3](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.0.2...typeorm-0.0.3) (2023-09-06)

### Dependency Updates

* `test-utils` updated to version `0.0.3`
* `exceptions` updated to version `0.0.3`
* `string-utils` updated to version `0.0.3`
## [0.0.2](https://github.com/saas-buildkit/saas-buildkit-core/compare/typeorm-0.0.1...typeorm-0.0.2) (2023-09-06)

### Dependency Updates

* `test-utils` updated to version `0.0.2`
* `exceptions` updated to version `0.0.2`
* `string-utils` updated to version `0.0.2`
## 0.0.1 (2023-09-06)

### Dependency Updates

* `test-utils` updated to version `0.0.1`
* `exceptions` updated to version `0.0.1`
* `string-utils` updated to version `0.0.1`

### Reverts

* Revert "ci: added no build param to npx-deploy-npm to do not depend on ngx build" ([a05a410](https://github.com/saas-buildkit/saas-buildkit-core/commit/a05a41073965039dd9656840a80144dcd6b4e180))
