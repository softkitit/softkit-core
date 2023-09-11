import { runLint } from './run-lint';
import { joinPathFragments } from '@nx/devkit';

describe('execute commands', () => {
  it('should successfully lint current repo', async () => {
    const cwd = joinPathFragments(__dirname, '../../../../..');
    await runLint('resource-plugin', 'lint', cwd);
  }, 10_000);

  it('should fail with some status', async () => {
    await expect(runLint('unknown-plugin', 'lint')).rejects.toBe(1);
  }, 10_000);
});
