import { execa } from 'execa';
import chalk from 'chalk';

export async function dev(options: any = {}) {
  console.log(chalk.cyan('Starting development server...'));

  try {
    await execa('bun', ['run', 'dev'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: options.port || '4321',
      },
    });
  } catch (error) {
    console.error(chalk.red('Failed to start dev server'));
    process.exit(1);
  }
}
