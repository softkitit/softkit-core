/* istanbul ignore file */
// eslint-disable-next-line complexity
export function isCI() {
  return (
    (process.env['CI'] && process.env['CI'] !== 'false') ||
    process.env['TF_BUILD'] === 'true' ||
    process.env['GITHUB_ACTIONS'] === 'true' ||
    process.env['BUILDKITE'] === 'true' ||
    process.env['CIRCLECI'] === 'true' ||
    process.env['CIRRUS_CI'] === 'true' ||
    process.env['TRAVIS'] === 'true' ||
    !!process.env['bamboo.buildKey'] ||
    !!process.env['bamboo_buildKey'] ||
    !!process.env['CODEBUILD_BUILD_ID'] ||
    !!process.env['GITLAB_CI'] ||
    !!process.env['HEROKU_TEST_RUN_ID'] ||
    !!process.env['BUILD_ID'] ||
    !!process.env['BUILD_BUILDID'] ||
    !!process.env['TEAMCITY_VERSION']
  );
}

export function isTTY(): boolean {
  return process.stdout.isTTY && !isCI();
}
