#!/usr/bin/env node

/**
 * 为 dist 目录下所有页面的 index.html 生成对应的英文版本 *-en.html
 * 使用 @kne/npm-tools entryHtml 注入 runtimeEnv (locale: en)
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');

/**
 * 递归查找 dist 目录下所有 index.html 文件（排除已有的 -en.html）
 */
function findIndexHtmlFiles(dir) {
  const results = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry === 'index.html') {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

const htmlFiles = findIndexHtmlFiles(DIST_DIR);

console.log(`Found ${htmlFiles.length} index.html files:\n`);

for (const htmlFile of htmlFiles) {
  const dir = dirname(htmlFile);
  const inputPath = htmlFile;
  const outputPath = join(dir, 'index-en.html');
  const relativePath = relative(DIST_DIR, htmlFile);

  console.log(`Processing: ${relativePath}`);

  try {
    execSync(
      `cross-env INDEX_HTML_PATH=${inputPath} OUTPUT_HTML_PATH=${outputPath} DEPLOY_URL=/ RUNTIME_ENV='isAP:true;locale:en' npx @kne/npm-tools entryHtml`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
    console.log(`  ✅ Generated: ${relative(DIST_DIR, outputPath)}\n`);
  } catch (error) {
    console.error(`  ❌ Failed: ${relativePath}`);
    console.error(`  Error: ${error.message}\n`);
    process.exit(1);
  }
}

console.log('🎉 All English HTML files generated successfully!');
