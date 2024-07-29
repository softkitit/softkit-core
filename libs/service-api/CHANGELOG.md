Softkit Core Libraries Changelog
## 0.1.0 (2024-07-29)


### Features

* **service-api:** renamed typeorm-service library to service-api to better reflect that it's a general service api and has nothing to do with typeorm ([70558c6](https://github.com/softkitit/softkit-core/commit/70558c639de77f9b962580638b050a745a167c85))

## [0.1.2](https://github.com/softkitit/softkit-core/compare/service-api-0.1.1...service-api-0.1.2) (2024-01-26)

## [0.1.1](https://github.com/softkitit/softkit-core/compare/service-api-0.1.0...service-api-0.1.1) (2024-01-26)

## [0.1.0](https://github.com/softkitit/softkit-core/compare/service-api-0.0.13...service-api-0.1.0) (2024-01-24)


### Features

* **common-types:** added never type to make all fields in object never and optional ([7bc4510](https://github.com/softkitit/softkit-core/commit/7bc45100b9aaa6228a1acf1abc94dc1f7082b51f))
* **service-api:** added where option condition to find all function in base service ([5ae5cb9](https://github.com/softkitit/softkit-core/commit/5ae5cb91dd976b9ac4e324d4708fe7313903a4cf))
* **service-api:** updated base services structure to match new repositories needs ([90b732d](https://github.com/softkitit/softkit-core/commit/90b732dd3b3cbc9ea6ea6875d3a4aa8c4e600f34))
* **typeorm:** fixed type definition for services, added ability to save record with ability to provide id, because sometimes ids must be defined externally, added tenant service test ([8073e37](https://github.com/softkitit/softkit-core/commit/8073e374e5ba9b25f8f908a52ae8fa592a2c4c0d))


### Bug Fixes

* **service-api:** improved typing for find one method, to return an exact type depends on throw or do not throw exception ([b1fc14a](https://github.com/softkitit/softkit-core/commit/b1fc14a5ad7b20c7022d3f76933a69cbc35b6899))
* **typeorm:** fixed paginate default logic with updated version of nestjs paginate ([dd6cf94](https://github.com/softkitit/softkit-core/commit/dd6cf94ab330ca9edde61454b8ee6461b57ff136))

## [0.0.13](https://github.com/softkitit/softkit-core/compare/service-api-0.0.12...service-api-0.0.13) (2023-12-11)


### Bug Fixes

* **service-api:** lint readme file ([7b900e4](https://github.com/softkitit/softkit-core/commit/7b900e4487a1488b55829b2a862b93712e9fba24))
* **service-api:** update nestjs-paginate version and test timeout ([50d4682](https://github.com/softkitit/softkit-core/commit/50d4682076c74c27f06afe2467d3df6114b214b3))

## [0.0.13](https://github.com/softkitit/softkit-core/compare/service-api-0.0.12...service-api-0.0.13) (2023-12-11)


### Bug Fixes

* **service-api:** lint readme file ([7b900e4](https://github.com/softkitit/softkit-core/commit/7b900e4487a1488b55829b2a862b93712e9fba24))
* **service-api:** update nestjs-paginate version and test timeout ([50d4682](https://github.com/softkitit/softkit-core/commit/50d4682076c74c27f06afe2467d3df6114b214b3))

## [0.0.12](https://github.com/softkitit/softkit-core/compare/service-api-0.0.11...service-api-0.0.12) (2023-11-19)


### Bug Fixes

* **service-api:** added proper types for create or update function. Implemented partial update with proper types ([b6c05c8](https://github.com/softkitit/softkit-core/commit/b6c05c80628779098b12b319d91fdcfbf714f50c))
* **service-api:** added proper types for create or update function. Implemented partial update with proper types ([5e2f4cc](https://github.com/softkitit/softkit-core/commit/5e2f4cc01f43399988243425d64a1ed72b8e5c47))

## [0.0.11](https://github.com/softkitit/softkit-core/compare/service-api-0.0.10...service-api-0.0.11) (2023-11-15)

## [0.0.10](https://github.com/softkitit/softkit-core/compare/service-api-0.0.9...service-api-0.0.10) (2023-11-09)


### Bug Fixes

* **service-api:** replaced paginate with transform mapping function to use a new unified mapper ([d133c24](https://github.com/softkitit/softkit-core/commit/d133c24e59e392a091d139467f057f1875842e8a))

## [0.0.9](https://github.com/softkitit/softkit-core/compare/service-api-0.0.8...service-api-0.0.9) (2023-11-08)

## [0.0.8](https://github.com/softkitit/softkit-core/compare/service-api-0.0.7...service-api-0.0.8) (2023-11-04)


### Bug Fixes

* **service-api:** added proper way to handle mapping for paginated queries ([9e35185](https://github.com/softkitit/softkit-core/commit/9e35185d6216ce64e03d162fb55fb7ddaf73a4ff))

## [0.0.8](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.7...service-api-0.0.8) (2023-11-04)


### Bug Fixes

* **service-api:** added proper way to handle mapping for paginated queries ([9e35185](https://github.com/saas-buildkit/saas-buildkit-core/commit/9e35185d6216ce64e03d162fb55fb7ddaf73a4ff))

## [0.0.7](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.6...service-api-0.0.7) (2023-09-13)


### Bug Fixes

* **resource-plugin:** fixed app and services generation ([80d3907](https://github.com/saas-buildkit/saas-buildkit-core/commit/80d3907881ca244e96aa017c8c9a3a83b2c132aa))

## [0.0.6](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.5...service-api-0.0.6) (2023-09-11)


### Bug Fixes

* **service-api:** added new test-utils methods ([54332e5](https://github.com/saas-buildkit/saas-buildkit-core/commit/54332e56cd4cf7c65fb62ca3def0d7add1966ae6))

## [0.0.5](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.4...service-api-0.0.5) (2023-09-08)


### Bug Fixes

* get rid of deprecated nx updateBuildableProjectDepsInPackageJson , configured nx-dependency check lint role instead ([9093be8](https://github.com/saas-buildkit/saas-buildkit-core/commit/9093be892fd5f71629a6c22388e12432dacefdec))
* **resource-plugin:** get of rid publish script and publish capabilities in each lib, because it handled by others ([6406664](https://github.com/saas-buildkit/saas-buildkit-core/commit/64066640d13cfc6bf4e16055349265015d7bcd12))

## [0.0.4](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.3...service-api-0.0.4) (2023-09-07)

### Dependency Updates

* `typeorm` updated to version `0.0.4`
* `test-utils` updated to version `0.0.4`
* `exceptions` updated to version `0.0.4`
* `string-utils` updated to version `0.0.4`
## [0.0.3](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.2...service-api-0.0.3) (2023-09-06)

### Dependency Updates

* `typeorm` updated to version `0.0.3`
* `test-utils` updated to version `0.0.3`
* `exceptions` updated to version `0.0.3`
* `string-utils` updated to version `0.0.3`
## [0.0.2](https://github.com/saas-buildkit/saas-buildkit-core/compare/service-api-0.0.1...service-api-0.0.2) (2023-09-06)

### Dependency Updates

* `typeorm` updated to version `0.0.2`
* `test-utils` updated to version `0.0.2`
* `exceptions` updated to version `0.0.2`
* `string-utils` updated to version `0.0.2`
## 0.0.1 (2023-09-06)

### Dependency Updates

* `typeorm` updated to version `0.0.1`
* `test-utils` updated to version `0.0.1`
* `exceptions` updated to version `0.0.1`
* `string-utils` updated to version `0.0.1`

### Reverts

* Revert "ci: added no build param to npx-deploy-npm to do not depend on ngx build" ([a05a410](https://github.com/saas-buildkit/saas-buildkit-core/commit/a05a41073965039dd9656840a80144dcd6b4e180))
