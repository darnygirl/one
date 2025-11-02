import prompts from 'prompts';
import ora from 'ora';
import chalk from 'chalk';
import degit from 'degit';
import fs from 'fs-extra';
import path from 'path';

export async function init(directory: string = '.', options: any = {}) {
  console.log(chalk.cyan(`
     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real
  `));

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: path.basename(path.resolve(directory)),
    },
    {
      type: 'select',
      name: 'template',
      message: 'Choose a template:',
      choices: [
        { title: 'Default (Astro + React + Tailwind)', value: 'default' },
        { title: 'Blog', value: 'blog' },
        { title: 'Portfolio', value: 'portfolio' },
        { title: 'E-commerce', value: 'ecommerce' },
      ],
      initial: 0,
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies?',
      initial: true,
    },
  ]);

  if (!response.projectName) {
    console.log(chalk.red('✖ Setup cancelled'));
    process.exit(0);
  }

  const spinner = ora('Creating project...').start();

  try {
    // Clone template from GitHub
    const emitter = degit('one-ie/web', {
      cache: false,
      force: true,
    });

    await emitter.clone(path.resolve(directory));

    // Update package.json with project name
    const pkgPath = path.join(directory, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = response.projectName;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    spinner.succeed(chalk.green('✓ Project created'));

    // Install dependencies
    if (response.installDeps) {
      spinner.start('Installing dependencies...');
      const { execa } = await import('execa');
      await execa('bun', ['install'], { cwd: path.resolve(directory) });
      spinner.succeed(chalk.green('✓ Dependencies installed'));
    }

    console.log();
    console.log(chalk.green('Success! Created ' + response.projectName));
    console.log();
    console.log('Next steps:');
    console.log(chalk.cyan(`  cd ${directory !== '.' ? directory : 'your-project'}`));
    console.log(chalk.cyan('  bun run dev'));
    console.log();

  } catch (error) {
    spinner.fail(chalk.red('✖ Failed to create project'));
    console.error(error);
    process.exit(1);
  }
}
