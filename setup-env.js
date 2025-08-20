#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up GrantSnap environment variables...\n');

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 Current contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('\n🔍 Checking Supabase project status...');
  console.log('⚠️  If you\'re getting DEPLOYMENT_NOT_FOUND errors, your Supabase project may need to be recreated.');
  console.log('📋 Please check: https://supabase.com/dashboard');
} else {
  // Create .env file with your actual Supabase credentials
  const envContent = `# Supabase Configuration
# ⚠️  IMPORTANT: Your previous project uurdubbsamdawncqkaoy appears to be deleted
# Please create a new Supabase project and update these values

VITE_SUPABASE_URL=https://your-new-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here

# Development Configuration
VITE_DEV_MODE=true
VITE_API_URL=http://localhost:3000

# To get your new Supabase credentials:
# 1. Go to https://supabase.com/dashboard
# 2. Create a new project or select existing one
# 3. Go to Settings > API
# 4. Copy the "Project URL" to VITE_SUPABASE_URL
# 5. Copy the "anon public" key to VITE_SUPABASE_ANON_KEY
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 File contents:');
    console.log(envContent);
    console.log('\n🔑 Note: You need to create a NEW Supabase project.');
    console.log('   The previous project uurdubbsamdawncqkaoy has been deleted.');
    console.log('\n🚀 After updating with real credentials, run: npm run dev');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('\n📝 Please create the .env file manually with the content above.');
  }
}
