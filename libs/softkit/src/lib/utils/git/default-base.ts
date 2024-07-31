import { execSync } from 'node:child_process';

/*
 */
export function deduceDefaultBase(): string {
  const skDefaultBase = 'main';
  try {
    return (
      execSync('git config --get init.defaultBranch').toString().trim() ||
      skDefaultBase
    );
  } catch {
    return skDefaultBase;
  }
}
