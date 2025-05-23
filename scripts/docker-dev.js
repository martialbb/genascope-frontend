import { spawn } from 'child_process';
import process from 'process';

console.log('Starting Astro in Docker with M1/M2 Mac compatibility settings...');

// Start Astro dev server with compatibility settings
const astro = spawn('astro', ['dev', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Additional environment variables to bypass architecture-specific issues
    ROLLUP_SKIP_NODEJS_CHECKS: 'true',
    VITE_SKIP_NATIVE_EXTENSIONS: 'true'
  }
});

astro.on('error', (err) => {
  console.error('Failed to start Astro:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  astro.kill('SIGINT');
  process.exit(0);
});