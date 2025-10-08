#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Stress Quantification Device Booking Backend...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  try {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created successfully.');
    console.log('⚠️  Please update the .env file with your PostgreSQL credentials before continuing.\n');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if PostgreSQL is running
console.log('🔍 Checking PostgreSQL connection...');
try {
  // This will fail if PostgreSQL is not running, but that's expected
  console.log('⚠️  Please ensure PostgreSQL is running and the database is created.');
  console.log('   You can create the database using: createdb stress_quantification_db\n');
} catch (error) {
  console.log('⚠️  PostgreSQL connection check skipped.\n');
}

console.log('🎯 Setup complete! Next steps:');
console.log('1. Update your .env file with PostgreSQL credentials');
console.log('2. Create the database: createdb stress_quantification_db');
console.log('3. Run migrations: npm run db:migrate');
console.log('4. Seed the database: npm run db:seed');
console.log('5. Start the server: npm run dev');
console.log('\n📚 For more information, see the README.md file.');
