Softkit Core Libraries Changelog
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
