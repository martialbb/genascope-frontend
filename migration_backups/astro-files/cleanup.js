#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// List of files to remove and add "no-recreate" markers to
const filesToCleanup = [
  'M1_MAC_SETUP.md',
  'M1_README_SECTION.md',
  'docker-entrypoint.sh',
  'fix-frontend.sh',
  'frontend.Dockerfile',
  'parseAst.patch.js',
  'pytest.ini',
  'run_tests.sh',
  'run_tests_updated.sh',
  'start-backend.sh',
  'start-dev-local.sh',
  'universal-fix.sh',
  'yarn-start.sh'
];

console.log('🧹 Cleaning up empty placeholder files...');

// Get the project root directory
const projectRoot = path.resolve(process.cwd());

// Process each file
filesToCleanup.forEach(file => {
  const filePath = path.join(projectRoot, file);
  
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    try {
      // Get the file size to check if it's empty
      const stats = fs.statSync(filePath);
      
      if (stats.size === 0) {
        // Remove the empty file
        fs.unlinkSync(filePath);
        console.log(`✅ Removed empty file: ${file}`);
      } else {
        console.log(`⚠️ File is not empty, skipping: ${file} (${stats.size} bytes)`);
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message);
    }
  } else {
    console.log(`ℹ️ File doesn't exist: ${file}`);
  }
});

console.log('\n✨ Cleanup completed! These files will be ignored by VSCode.');
console.log('📝 To prevent them from being recreated, make sure to:');
console.log('   1. Close and reopen VSCode');
console.log('   2. Restart the VS Code FileWatcher by running the command:');
console.log('      > Developer: Restart File Watcher');
