import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';

export async function deploy(options: any = {}) {
  const spinner = ora('Deploying to Cloudflare Pages...').start();

  try {
    // Check if dist exists
    if (!await fs.pathExists('dist')) {
      spinner.warn(chalk.yellow('No dist directory found, building first...'));
      await execa('bun', ['run', 'build'], { stdio: 'inherit' });
    }

    // Deploy with wrangler
    const args = ['pages', 'deploy', 'dist'];

    if (options.project) {
      args.push('--project-name', options.project);
    }

    if (options.branch) {
      args.push('--branch', options.branch);
    }

    await execa('wrangler', args, {
      stdio: 'inherit',
    });

    spinner.succeed(chalk.green('✓ Deployment complete'));
  } catch (error) {
    spinner.fail(chalk.red('✖ Deployment failed'));
    console.error(error);
    process.exit(1);
  }
}
