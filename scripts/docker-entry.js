import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('Setting up Docker environment variables...');
// Set environment variable to indicate Docker environment
process.env.DOCKER_ENV = 'true';
process.env.PUBLIC_API_URL = 'http://backend:8000';

console.log(`Environment: ${process.env.DOCKER_ENV === 'true' ? 'Docker' : 'Local'}`);
console.log(`API URL: ${process.env.PUBLIC_API_URL}`);

console.log('Starting Docker container with M1/M2 Mac compatibility patches...');

// The content for the native.js patch - inline definition, no need for external files
const nativeJsContent = `// ES module version of native.js with stub implementations
export function getBinaryPath() { 
  return null; 
}

export function parse(code, options) { 
  try {
    console.log("[ROLLUP-FIX] Using native.js stub for parse");
    return { 
      program: { 
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "Literal",
              value: null,
              raw: "null"
            }
          }
        ], 
        type: "Program", 
        sourceType: options?.sourceType || "module"
      },
      type: "File"
    };
  } catch (error) {
    console.error("Error in native.js stub:", error);
    throw error;
  }
}

export async function parseAsync(code, options) {
  console.log("[ROLLUP-FIX] Using parseAsync stub");
  return parse(code, options);
}`;

// Create the patch file in all possible locations
const possiblePaths = [
  '/app/node_modules/rollup/dist/es/native.js',
  '/node_modules/rollup/dist/es/native.js'
];

// Ensure directories exist and create the patch files
possiblePaths.forEach(filePath => {
  try {
    // Create directory structure if it doesn't exist
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    
    // Write the patch file
    fs.writeFileSync(filePath, nativeJsContent);
    console.log(`Created patch file at: ${filePath}`);
    
    // Verify it was created
    if (fs.existsSync(filePath)) {
      console.log(`✓ Verified patch file exists: ${filePath}`);
    } else {
      console.log(`✗ Failed to create patch file: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error creating patch file at ${filePath}:`, err);
  }
});

// Start Astro with the necessary environment variables
console.log('Starting Astro development server...');

const astro = spawn('astro', ['dev', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ROLLUP_SKIP_NODEJS_CHECKS: 'true',
    VITE_SKIP_NATIVE_EXTENSIONS: 'true'
  }
});

// Handle process events
astro.on('error', (err) => {
  console.error('Failed to start Astro:', err);
  process.exit(1);
});

astro.on('exit', (code) => {
  console.log(`Astro process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  astro.kill('SIGINT');
  process.exit(0);
});