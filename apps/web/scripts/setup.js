const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up @hobby-baseline/web...');

// .env ファイルのパス
const envPath = path.join(__dirname, '..', '.env');

// デフォルトの環境変数
const defaultEnvContent = `# Web Application Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
`;

// .env ファイルが存在しない場合は作成
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, defaultEnvContent);
  console.log('✅ Created .env file');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('✨ Setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('  1. Run "npm install" to install dependencies');
console.log('  2. Run "npm run dev" to start the development server');