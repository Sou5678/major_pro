#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: package.json exists
console.log('✓ Checking package.json...');
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found!');
  hasErrors = true;
} else {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.scripts?.build) {
    console.error('❌ No build script found in package.json!');
    hasErrors = true;
  }
  if (!pkg.scripts?.start) {
    console.error('❌ No start script found in package.json!');
    hasErrors = true;
  }
}

// Check 2: .env.local.example exists
console.log('✓ Checking environment template...');
if (!fs.existsSync('.env.local.example')) {
  console.warn('⚠️  .env.local.example not found - create one for documentation');
  hasWarnings = true;
}

// Check 3: .gitignore includes env files
console.log('✓ Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.env')) {
    console.error('❌ .gitignore does not include .env files!');
    hasErrors = true;
  }
} else {
  console.error('❌ .gitignore not found!');
  hasErrors = true;
}

// Check 4: Required dependencies
console.log('✓ Checking dependencies...');
const requiredDeps = [
  'next',
  'react',
  'react-dom',
  'mongodb',
  '@supabase/supabase-js',
  'groq-sdk',
];

if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  requiredDeps.forEach(dep => {
    if (!allDeps[dep]) {
      console.error(`❌ Missing required dependency: ${dep}`);
      hasErrors = true;
    }
  });
}

// Check 5: Next.js config
console.log('✓ Checking Next.js configuration...');
if (!fs.existsSync('next.config.ts') && !fs.existsSync('next.config.js')) {
  console.warn('⚠️  next.config file not found');
  hasWarnings = true;
}

// Check 6: TypeScript config
console.log('✓ Checking TypeScript configuration...');
if (!fs.existsSync('tsconfig.json')) {
  console.error('❌ tsconfig.json not found!');
  hasErrors = true;
}

// Check 7: App directory structure
console.log('✓ Checking app directory structure...');
if (!fs.existsSync('app')) {
  console.error('❌ app directory not found!');
  hasErrors = true;
} else {
  if (!fs.existsSync('app/layout.tsx')) {
    console.error('❌ app/layout.tsx not found!');
    hasErrors = true;
  }
  if (!fs.existsSync('app/page.tsx')) {
    console.error('❌ app/page.tsx not found!');
    hasErrors = true;
  }
}

// Check 8: API routes
console.log('✓ Checking API routes...');
const requiredApiRoutes = [
  'app/api/auth/signin/route.ts',
  'app/api/auth/signup/route.ts',
  'app/api/resume/upload/route.ts',
  'app/api/resume/analyze/route.ts',
];

requiredApiRoutes.forEach(route => {
  if (!fs.existsSync(route)) {
    console.warn(`⚠️  API route not found: ${route}`);
    hasWarnings = true;
  }
});

// Check 9: Environment variables documentation
console.log('✓ Checking environment variables...');
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

if (fs.existsSync('.env.local.example')) {
  const envExample = fs.readFileSync('.env.local.example', 'utf8');
  requiredEnvVars.forEach(envVar => {
    if (!envExample.includes(envVar)) {
      console.warn(`⚠️  Environment variable not documented: ${envVar}`);
      hasWarnings = true;
    }
  });
}

// Check 10: Build test
console.log('✓ Checking if project builds...');
console.log('  (Run "npm run build" manually to verify)\n');

// Summary
console.log('═══════════════════════════════════════════════════════');
if (hasErrors) {
  console.error('❌ Pre-deployment check FAILED!');
  console.error('   Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  Pre-deployment check passed with warnings.');
  console.warn('   Consider fixing the warnings above.\n');
  process.exit(0);
} else {
  console.log('✅ All pre-deployment checks passed!');
  console.log('   Your project is ready to deploy.\n');
  process.exit(0);
}
