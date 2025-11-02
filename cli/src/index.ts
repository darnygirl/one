#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { dev } from './commands/dev.js';
import { build } from './commands/build.js';
import { deploy } from './commands/deploy.js';

const program = new Command();

program
  .name('oneie')
  .description('ONE Platform CLI - Build apps, websites, and AI agents in English')
  .version('3.6.13');

program
  .command('init')
  .description('Initialize a new ONE Platform project')
  .argument('[directory]', 'Project directory', '.')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(init);

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to run on', '4321')
  .action(dev);

program
  .command('build')
  .description('Build for production')
  .option('--no-check', 'Skip type checking')
  .action(build);

program
  .command('deploy')
  .description('Deploy to Cloudflare Pages')
  .option('--project <name>', 'Cloudflare project name')
  .option('--branch <name>', 'Branch name', 'production')
  .action(deploy);

program.parse();
