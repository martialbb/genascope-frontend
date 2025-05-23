import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Ensure necessary directories exist
console.log('Setting up environment for Docker development...');

// Define paths - check both potential locations
const pathsToCheck = [
  '/app/node_modules/rollup/dist/es/',
  '/node_modules/rollup/dist/es/'
];

// Create native.js patch content
const nativeJsContent = `// ES module version of native.js with stub implementations
export function getBinaryPath() { 
  return null; 
}

export function parse(code, options) { 
  try {
    console.log("[ROLLUP-FIX] Using enhanced native.js stub for parse");
    return { 
      program: { 
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "Literal",
              value: null,
              raw: "null"
            },
            start: 0,
            end: 4
          }
        ], 
        type: "Program", 
        sourceType: options?.sourceType || "module",
        start: 0,
        end: code ? code.length : 0
      },
      type: "File",
      version: "unknown",
      comments: [],
      tokens: []
    };
  } catch (error) {
    console.error("Error in native.js stub:", error);
    throw error;
  }
}

export async function parseAsync(code, options) {
  console.log("[ROLLUP-FIX] Parsing code with parseAstAsync");
  return parse(code, options);
}`;

// Create the patch file in both potential locations
pathsToCheck.forEach(dir => {
  try {
    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
    
    // Create the patch file
    fs.writeFileSync(path.join(dir, 'native.js'), nativeJsContent);
    console.log(`Created patch file: ${path.join(dir, 'native.js')}`);
    
    // Verify file exists
    if (fs.existsSync(path.join(dir, 'native.js'))) {
      console.log(`Verified patch file exists at: ${path.join(dir, 'native.js')}`);
    }
  } catch (error) {
    console.error(`Error setting up patch at ${dir}:`, error);
  }
});

// Create a symbolic link to ensure path consistency
try {
  if (fs.existsSync('/app/node_modules') && !fs.existsSync('/node_modules')) {
    fs.symlinkSync('/app/node_modules', '/node_modules', 'dir');
    console.log('Created symbolic link from /app/node_modules to /node_modules');
  }
} catch (error) {
  console.error('Error creating symbolic link:', error);
}

// List files to verify
console.log('Verifying directory contents:');
pathsToCheck.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      console.log(`Contents of ${dir}:`, fs.readdirSync(dir));
    } else {
      console.log(`Directory ${dir} does not exist`);
    }
  } catch (error) {
    console.error(`Error listing directory ${dir}:`, error);
  }
});

// Start Astro with compatibility settings
console.log('Starting Astro with compatibility settings...');
const astro = spawn('astro', ['dev', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
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