import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const packageDirectories = ['core', 'vue', 'vue2', 'react'];
const isDryRun = process.argv.includes('--dry-run');

const run = (command, args, cwd = process.cwd()) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

// 发布前统一完成测试、类型检查和构建，避免上传未经验证的产物。
run('pnpm', ['check']);

for (const directory of packageDirectories) {
  const cwd = new URL(`../packages/${directory}/`, import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('package.json', cwd), 'utf8'));
  const args = ['publish', '--access', 'public', '--no-git-checks'];
  if (isDryRun) args.push('--dry-run');

  process.stdout.write(
    `\nPublishing ${manifest.name}@${manifest.version}${isDryRun ? ' (dry run)' : ''}\n`,
  );
  run('pnpm', args, cwd);
}
