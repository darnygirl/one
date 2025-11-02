import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

export async function build(options: any = {}) {
  const spinner = ora('Building for production...').start();

  try {
    const args = ['run', 'build'];
    if (options.check === false) {
      process.env.SKIP_CHECK = 'true';
    }

    await execa('bun', args, {
      stdio: 'inherit',
    });

    spinner.succeed(chalk.green('✓ Build complete'));
  } catch (error) {
    spinner.fail(chalk.red('✖ Build failed'));
    process.exit(1);
  }
}
