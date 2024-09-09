Softkit Core Libraries Changelog
## [1.2.0](https://github.com/softkitit/softkit-core/compare/auth-1.1.0...auth-1.2.0) (2024-09-09)


### Features

* **auth:** enhance access guard and roles decorator for non-tenant system ([4c927bd](https://github.com/softkitit/softkit-core/commit/4c927bd495ed9bbc57442fe191e8d18639426d7a))

## [1.1.0](https://github.com/softkitit/softkit-core/compare/auth-1.0.9...auth-1.1.0) (2024-07-29)


### Features

* **auth:** added usage of new persistence api instead of typeorm for decoupling services ([4cdf8e1](https://github.com/softkitit/softkit-core/commit/4cdf8e18e8c8b7363ad91f3ffbe3ea32949445e7))

## [1.0.9](https://github.com/softkitit/softkit-core/compare/auth-1.0.8...auth-1.0.9) (2024-05-17)


### Bug Fixes

* **auth:** improved logs to include context and show errors stacktrace properly ([6b52a73](https://github.com/softkitit/softkit-core/commit/6b52a731780f0db6f9a2dcadc2794ac9f4704794))

## [1.0.8](https://github.com/softkitit/softkit-core/compare/auth-1.0.7...auth-1.0.8) (2024-01-26)

## [1.0.7](https://github.com/softkitit/softkit-core/compare/auth-1.0.6...auth-1.0.7) (2024-01-26)

## [1.0.6](https://github.com/softkitit/softkit-core/compare/auth-1.0.5...auth-1.0.6) (2024-01-24)

## [1.0.5](https://github.com/softkitit/softkit-core/compare/auth-1.0.4...auth-1.0.5) (2023-12-15)


### Bug Fixes

* **exceptions:** swapped the “Error code” and “Root cause” fields ([462a382](https://github.com/softkitit/softkit-core/commit/462a382880b889f3d4d37004d6e44b5917118238))

## [1.0.4](https://github.com/softkitit/softkit-core/compare/auth-1.0.3...auth-1.0.4) (2023-12-11)

## [1.0.3](https://github.com/softkitit/softkit-core/compare/auth-1.0.2...auth-1.0.3) (2023-12-04)


### Bug Fixes

* **auth:** updated the refresh token guards path ([a40b90f](https://github.com/softkitit/softkit-core/commit/a40b90f246a5b5bedc0e45d5ea04e8d7d4e49a11))
* **auth:** updated the refresh token guards to get current user data in endpoints ([d51f67e](https://github.com/softkitit/softkit-core/commit/d51f67e150354cc169204e5a4acba80c88c2e3a5))

## [1.0.2](https://github.com/softkitit/softkit-core/compare/auth-1.0.1...auth-1.0.2) (2023-11-21)


### Bug Fixes

* **auth:** made role type optional in jwt payload to support custom roles ([04b5b40](https://github.com/softkitit/softkit-core/commit/04b5b40f7cdd65017c5e107f33b2cc051ec370ad))

## [1.0.1](https://github.com/softkitit/softkit-core/compare/auth-1.0.0...auth-1.0.1) (2023-11-15)

## [1.0.0](https://github.com/softkitit/softkit-core/compare/auth-0.1.0...auth-1.0.0) (2023-11-14)


### ⚠ BREAKING CHANGES

* **auth:** implemented roles decorator and handler for the decorator in access guard

### Features

* **auth:** implemented roles decorator and handler for the decorator in access guard ([a94600f](https://github.com/softkitit/softkit-core/commit/a94600fb8f0199e2d9bc3ed8cf9014f233ef126d))

## [0.1.0](https://github.com/softkitit/softkit-core/compare/auth-0.0.6...auth-0.1.0) (2023-11-04)


### Features

* **auth:** added tenantId resolution service ([2b01e80](https://github.com/softkitit/softkit-core/commit/2b01e803151376f5812e26c7c3b6b32e4621d802))
* **auth:** generalized the use of auth library in terms of token building and multi tenancy ([989631b](https://github.com/softkitit/softkit-core/commit/989631b80f89b7b081f52480271776586a6e96ff))
* **auth:** implemented permission check interface and base service for check in a token ([afbc30a](https://github.com/softkitit/softkit-core/commit/afbc30afa2fd7e2ffe8326b9437dd9a4ba6849b8))


### Bug Fixes

* **auth:** added tenant id resolution even for unauthorized endpoints ([1c422de](https://github.com/softkitit/softkit-core/commit/1c422dee518653c2fb91c6c25f1520a95408f729))
* **auth:** excluded unnecessary dependencies. Added auth header for user clsStore ([301d672](https://github.com/softkitit/softkit-core/commit/301d6720c1e102bd6c8ba4305aa26eb06856c119))

## [0.1.0](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.6...auth-0.1.0) (2023-11-04)


### Features

* **auth:** added tenantId resolution service ([2b01e80](https://github.com/saas-buildkit/saas-buildkit-core/commit/2b01e803151376f5812e26c7c3b6b32e4621d802))
* **auth:** generalized the use of auth library in terms of token building and multi tenancy ([989631b](https://github.com/saas-buildkit/saas-buildkit-core/commit/989631b80f89b7b081f52480271776586a6e96ff))
* **auth:** implemented permission check interface and base service for check in a token ([afbc30a](https://github.com/saas-buildkit/saas-buildkit-core/commit/afbc30afa2fd7e2ffe8326b9437dd9a4ba6849b8))


### Bug Fixes

* **auth:** added tenant id resolution even for unauthorized endpoints ([1c422de](https://github.com/saas-buildkit/saas-buildkit-core/commit/1c422dee518653c2fb91c6c25f1520a95408f729))
* **auth:** excluded unnecessary dependencies. Added auth header for user clsStore ([301d672](https://github.com/saas-buildkit/saas-buildkit-core/commit/301d6720c1e102bd6c8ba4305aa26eb06856c119))

## [0.0.6](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.5...auth-0.0.6) (2023-09-11)

## [0.0.5](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.4...auth-0.0.5) (2023-09-08)


### Bug Fixes

* get rid of deprecated nx updateBuildableProjectDepsInPackageJson , configured nx-dependency check lint role instead ([9093be8](https://github.com/saas-buildkit/saas-buildkit-core/commit/9093be892fd5f71629a6c22388e12432dacefdec))
* **resource-plugin:** get of rid publish script and publish capabilities in each lib, because it handled by others ([6406664](https://github.com/saas-buildkit/saas-buildkit-core/commit/64066640d13cfc6bf4e16055349265015d7bcd12))

## [0.0.4](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.3...auth-0.0.4) (2023-09-07)

### Dependency Updates

* `exceptions` updated to version `0.0.4`
* `typeorm` updated to version `0.0.4`
## [0.0.3](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.2...auth-0.0.3) (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.3`
* `typeorm` updated to version `0.0.3`
## [0.0.2](https://github.com/saas-buildkit/saas-buildkit-core/compare/auth-0.0.1...auth-0.0.2) (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.2`
* `typeorm` updated to version `0.0.2`
## 0.0.1 (2023-09-06)

### Dependency Updates

* `exceptions` updated to version `0.0.1`
* `typeorm` updated to version `0.0.1`

### Reverts

* Revert "ci: added no build param to npx-deploy-npm to do not depend on ngx build" ([a05a410](https://github.com/saas-buildkit/saas-buildkit-core/commit/a05a41073965039dd9656840a80144dcd6b4e180))
