import { sync } from 'cross-spawn';

export function spawnNextCommand({ nextCommand, nextCommandArgs, env }) {
  return sync(nextCommand, nextCommandArgs, {
    stdio: 'inherit',
    env,
  });
}
