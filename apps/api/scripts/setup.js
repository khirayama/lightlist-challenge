import { existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../.env');
const envExamplePath = resolve(__dirname, '../.env.example');

if (!existsSync(envPath)) {
  console.log('Creating .env file from .env.example...');
  copyFileSync(envExamplePath, envPath);
  console.log('.env file created successfully!');
  console.log('Please update the .env file with your actual values.');
} else {
  console.log('.env file already exists.');
}