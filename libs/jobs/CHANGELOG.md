Softkit Core Libraries Changelog
## [0.2.2](https://github.com/softkitit/softkit-core/compare/jobs-0.2.1...jobs-0.2.2) (2024-05-17)


### Bug Fixes

* **jobs:** improved logs to include context and show errors stacktrace properly ([143d769](https://github.com/softkitit/softkit-core/commit/143d7698ad2b6dab83d4c52bf62b88b16f25648b))
* **jobs:** removed duplicate eslint rule ([bc4f6c1](https://github.com/softkitit/softkit-core/commit/bc4f6c1b893f33f1c25cab86b6d65a042958d123))

## [0.2.1](https://github.com/softkitit/softkit-core/compare/jobs-0.2.0...jobs-0.2.1) (2024-05-11)


### Bug Fixes

* **jobs:** updated tests to add logger config after fixing issue with logger misconfiguration ([4e9d316](https://github.com/softkitit/softkit-core/commit/4e9d3163145b0a427b13d335342ada3f7e0be1d1))

## [0.2.0](https://github.com/softkitit/softkit-core/compare/jobs-0.1.5...jobs-0.2.0) (2024-02-07)


### Features

* **jobs:** updated nestjs bullmq version, to support bullmq 5 properly ([7d21892](https://github.com/softkitit/softkit-core/commit/7d21892473e3b17ae9ff7f1824b9857ddb716946))

## [0.1.5](https://github.com/softkitit/softkit-core/compare/jobs-0.1.4...jobs-0.1.5) (2024-02-05)


### Bug Fixes

* **jobs:** removed dependency on saas-buildkit/i18n library ([023846e](https://github.com/softkitit/softkit-core/commit/023846ec132c837f0bedc66754d190945b9b6d95))

## [0.1.4](https://github.com/softkitit/softkit-core/compare/jobs-0.1.3...jobs-0.1.4) (2024-01-26)

## [0.1.3](https://github.com/softkitit/softkit-core/compare/jobs-0.1.2...jobs-0.1.3) (2024-01-26)


### Bug Fixes

* **jobs:** applied bullmq best practices in configuration, updated readme ([7372b21](https://github.com/softkitit/softkit-core/commit/7372b211d1d270de16599c603967b1d9f69be413))

## [0.1.2](https://github.com/softkitit/softkit-core/compare/jobs-0.1.1...jobs-0.1.2) (2024-01-26)


### Bug Fixes

* **jobs:** removed connectionTimeout option for the queue client, because client must be blocking for as long as needed ([2944305](https://github.com/softkitit/softkit-core/commit/2944305b4fea94ee55ea88c8603611e245239c51))

## [0.1.1](https://github.com/softkitit/softkit-core/compare/jobs-0.1.0...jobs-0.1.1) (2024-01-24)

## 0.1.0 (2024-01-24)


### Features

* **jobs:** added ability to schedule a job now, updated scheduling service api, keep 100% coverage ([1e47853](https://github.com/softkitit/softkit-core/commit/1e478534c13882ddc92cd7ee9239e6f2cb1dfd00))
* **jobs:** added ability to schedule a job now, updated scheduling service api, keep 100% coverage ([9badb9c](https://github.com/softkitit/softkit-core/commit/9badb9cba89cfb0906a0ebea6c7909591920235d))
* **jobs:** added proper logger with context propagation to auto populate context fields like queue name, job id, etc. Added additional testing ([a153898](https://github.com/softkitit/softkit-core/commit/a1538988d5ef7cfa5fe17f86466acdd5a2000e84))
* **jobs:** added startup lock to prevent app to have concurrency problems ([ccce6ba](https://github.com/softkitit/softkit-core/commit/ccce6bac31e3e041a2ba4057f4f1ea76b55e4427))
* **jobs:** automated bull jobs creation and auto queue registrations, introduced one connection by queue by default ([7ceedaa](https://github.com/softkitit/softkit-core/commit/7ceedaad2a1f875e282880899b93453108ba3d68))
* **jobs:** full implementation for system jobs ([33c6afa](https://github.com/softkitit/softkit-core/commit/33c6afa3c2583bc97f5355b770861b3218d25b85))
* **jobs:** get rid of base job data, updated test to verify that jobs saved to db ([22a7780](https://github.com/softkitit/softkit-core/commit/22a77805b0094e762e7149434fa254ecb459715a))
* **jobs:** implemented proper locking mechanism for jobs, to prevent multiple executions of the job ([8cc4d81](https://github.com/softkitit/softkit-core/commit/8cc4d8114cdf9d44ab4f6f49b79e76d7a9e283fb))


### Bug Fixes

* eslint fixes ([2c08b69](https://github.com/softkitit/softkit-core/commit/2c08b69e37c1bf3fd3000c4703603657eeba7f06))
* **jobs:** enabled default offline queue ([3c9dc8a](https://github.com/softkitit/softkit-core/commit/3c9dc8a7fe0c9b56356463f28c8ce91436550ff2))
* **jobs:** fixed onetomany relation for jobdefinition and jobversion entities ([16bb5c9](https://github.com/softkitit/softkit-core/commit/16bb5c962594d59f517d028d465826e1afe467c2))
* **jobs:** more tests and some basic logic for exactly one consistency ([56eccb8](https://github.com/softkitit/softkit-core/commit/56eccb868d5d72ec2c41be1e328f58dbd0a283ce))
* **jobs:** more tests and some basic logic for exactly one consistency ([73b7d69](https://github.com/softkitit/softkit-core/commit/73b7d692e398f14954105835e32c8043c1d2b9d1))
* **jobs:** refactored job hierarchy to have methods with the same name, introduce single job per cluster policy ([ef89cf6](https://github.com/softkitit/softkit-core/commit/ef89cf6d72b98f5a94a02257d826203e1e1ed4ba))
* **jobs:** removed unnessary default function ([98fabcf](https://github.com/softkitit/softkit-core/commit/98fabcfdf3b115c58952f6e85126f973af735d6e))
* **jobs:** renamed jobs service ([686e1e6](https://github.com/softkitit/softkit-core/commit/686e1e6cbfbaf16ab2a0fce183ab1a90c054eb37))
