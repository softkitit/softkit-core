import * as process from 'node:process';

export function getProfiles(): string[] {
  const profiles = process.env['NESTJS_PROFILES'] || '';
  return profiles.split(',').map((p) => p.trim().toLowerCase());
}
