Softkit Core Libraries Changelog
## [0.5.0](https://github.com/softkitit/softkit-core/compare/validation-0.4.0...validation-0.5.0) (2024-07-11)


### Features

* **validation:** add validate nested property decorator ([364c4bb](https://github.com/softkitit/softkit-core/commit/364c4bb7e81fe07bc2f45e09a4da0c38f61cf687))

## [0.4.0](https://github.com/softkitit/softkit-core/compare/validation-0.3.7...validation-0.4.0) (2024-06-24)


### Features

* **file-storage:** covered the code ([582ee74](https://github.com/softkitit/softkit-core/commit/582ee746298d62f74d9231c483f8c2b2a7009bc0))
* **file-storage:** updated after reviewing ([d709ac2](https://github.com/softkitit/softkit-core/commit/d709ac290285aa7900c87cca1f977e42fe8c2830))


### Bug Fixes

* **validation:** added the array size validator ([40f9e5d](https://github.com/softkitit/softkit-core/commit/40f9e5d665da92b095184b269175f668035f537b))
* **validation:** fixed i18n library version ([2bc5385](https://github.com/softkitit/softkit-core/commit/2bc53855b9442aebeb512dc8ecd583f5c6a5658e))

## [0.3.7](https://github.com/softkitit/softkit-core/compare/validation-0.3.6...validation-0.3.7) (2024-02-05)


### Bug Fixes

* **validation:** removed dependency on saas-buildkit/i18n library ([78e0e54](https://github.com/softkitit/softkit-core/commit/78e0e5407fffb0d86b76389150b3f70ff56c500c))
* **validation:** updated types according to new validator.js version ([0cededb](https://github.com/softkitit/softkit-core/commit/0cededbd9a1611e245014bfd95909ece4c252b88))

## [0.3.6](https://github.com/softkitit/softkit-core/compare/validation-0.3.5...validation-0.3.6) (2024-01-26)


### Bug Fixes

* **validation:** added proper import for validator.js functions ([bd98317](https://github.com/softkitit/softkit-core/commit/bd98317a258e092bf8128afbef514c2c0edac83f))

## [0.3.5](https://github.com/softkitit/softkit-core/compare/validation-0.3.4...validation-0.3.5) (2024-01-24)


### Bug Fixes

* **validation:** added new isIntegerLocalized decorator, improved IsIntegerString ([a9d0cda](https://github.com/softkitit/softkit-core/commit/a9d0cdab06257aa044cddb0cc2f3f6e63dad1a21))
* **validation:** exported missing int-validator ([a3bc3d8](https://github.com/softkitit/softkit-core/commit/a3bc3d8e8b2074b04e0be2a5734c1020073aed60))
* **validation:** fixed to integer transform to handle null and undefined cases for optional integers ([d8e0e18](https://github.com/softkitit/softkit-core/commit/d8e0e18592c71aeff4ed40f9a6e0c2b4ae9db52b))
* **validation:** fixed to integer transformer again ([0100fbc](https://github.com/softkitit/softkit-core/commit/0100fbc33b58f55e1aecab70d3090c76e0d95c7c))

## [0.3.4](https://github.com/softkitit/softkit-core/compare/validation-0.3.3...validation-0.3.4) (2023-12-13)


### Bug Fixes

* **validation:** fixed the string enum validation message ([3cfb20c](https://github.com/softkitit/softkit-core/commit/3cfb20c12c2924a2c255cd12604d4ab0e113c4b1))

## [0.3.3](https://github.com/softkitit/softkit-core/compare/validation-0.3.2...validation-0.3.3) (2023-12-01)


### Bug Fixes

* **validation:** add support for string array in trimAndLowerCaseTransformer ([53f4447](https://github.com/softkitit/softkit-core/commit/53f444788757e87c6c9903f758e0264c089a7eb0))
* **validation:** export maxLengthLocalized decorator ([35984d6](https://github.com/softkitit/softkit-core/commit/35984d674c6fa584704dfc3b07ce8e0d7ea2a942))
* **validation:** update IsEmailLocalized to separate IsEmail and emailValidation options ([ac92f54](https://github.com/softkitit/softkit-core/commit/ac92f54f00ca09af654a6bc9377d19900dff7a8e))
* **validation:** update type definitions in is-email-validator ([d288756](https://github.com/softkitit/softkit-core/commit/d2887560404e4815e26cc9d8b93b645f9acad3a7))

## [0.3.2](https://github.com/softkitit/softkit-core/compare/validation-0.3.1...validation-0.3.2) (2023-11-15)

## [0.3.1](https://github.com/softkitit/softkit-core/compare/validation-0.3.0...validation-0.3.1) (2023-11-09)


### Bug Fixes

* **validation:** correct typo in filename ([5958583](https://github.com/softkitit/softkit-core/commit/5958583f571127197bca08104b733e581859a5e7))

## [0.3.0](https://github.com/softkitit/softkit-core/compare/validation-0.2.0...validation-0.3.0) (2023-11-09)


### Features

* **validation:** implemented base mapping function to reuse everywhere with proper default parameters to cover common needs ([023ec32](https://github.com/softkitit/softkit-core/commit/023ec329e0544c919bb91ed7ee19b22a26470325))


### Bug Fixes

* **validation:** replace plainToInstance with new map function ([337ad3d](https://github.com/softkitit/softkit-core/commit/337ad3d37e5a916fc87f287e7cc6177af93de3ac))

## [0.2.0](https://github.com/softkitit/softkit-core/compare/validation-0.1.3...validation-0.2.0) (2023-11-08)


### Features

* **validation:** added trim transformer ([37f500c](https://github.com/softkitit/softkit-core/commit/37f500c1d9b0404ca8f6a281b60dad381562ec0d))

## [0.1.3](https://github.com/softkitit/softkit-core/compare/validation-0.1.2...validation-0.1.3) (2023-11-04)


### Bug Fixes

* **validation:** added trim and lowercase transformer ([ac0538e](https://github.com/softkitit/softkit-core/commit/ac0538e7efe659938e31b499e2c934de7c10ddff))

## [0.1.3](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.1.2...validation-0.1.3) (2023-11-04)


### Bug Fixes

* **validation:** added trim and lowercase transformer ([ac0538e](https://github.com/saas-buildkit/saas-buildkit-core/commit/ac0538e7efe659938e31b499e2c934de7c10ddff))

## [0.1.2](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.1.1...validation-0.1.2) (2023-09-23)


### Bug Fixes

* **validation:** added ability to pass an integer to the toInteger transformer ([0cd113b](https://github.com/saas-buildkit/saas-buildkit-core/commit/0cd113b96fef4aa11e5783fd2ff0b5e6ba9fc2a6))

## [0.1.1](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.1.0...validation-0.1.1) (2023-09-11)

## [0.1.0](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.0.5...validation-0.1.0) (2023-09-09)


### Features

* **exceptions:** added swagger annotations for all exceptions in module ([c39b916](https://github.com/saas-buildkit/saas-buildkit-core/commit/c39b9160b7606d4c66dcb53fbb2b00beaa472959))

## [0.0.5](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.0.4...validation-0.0.5) (2023-09-08)


### Bug Fixes

* get rid of deprecated nx updateBuildableProjectDepsInPackageJson , configured nx-dependency check lint role instead ([9093be8](https://github.com/saas-buildkit/saas-buildkit-core/commit/9093be892fd5f71629a6c22388e12432dacefdec))
* **resource-plugin:** get of rid publish script and publish capabilities in each lib, because it handled by others ([6406664](https://github.com/saas-buildkit/saas-buildkit-core/commit/64066640d13cfc6bf4e16055349265015d7bcd12))

## [0.0.4](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.0.3...validation-0.0.4) (2023-09-07)

### Dependency Updates

* `exceptions` updated to version `0.0.4`
## [0.0.3](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.0.2...validation-0.0.3) (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.3`
## [0.0.2](https://github.com/saas-buildkit/saas-buildkit-core/compare/validation-0.0.1...validation-0.0.2) (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.2`
## 0.0.1 (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.1`

### Reverts

* Revert "ci: added no build param to npx-deploy-npm to do not depend on ngx build" ([a05a410](https://github.com/saas-buildkit/saas-buildkit-core/commit/a05a41073965039dd9656840a80144dcd6b4e180))
