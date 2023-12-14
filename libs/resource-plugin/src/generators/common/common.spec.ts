import { workspaceRoot } from '@nx/devkit';
import { runLint } from './run-lint';

describe('execute commands', () => {
  it('should successfully lint current repo', async () => {
    await runLint('resource-plugin', 'lint', workspaceRoot);
  }, 10_000);

  it('should fail with some status', async () => {
    await expect(runLint('unknown-plugin', 'lint')).rejects.toBe(1);
  }, 10_000);
});
