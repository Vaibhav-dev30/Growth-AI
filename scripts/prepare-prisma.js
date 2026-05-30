const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error(`[Prepare Prisma] Error: schema.prisma not found at ${schemaPath}`);
  process.exit(1);
}

let schemaContent = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = process.env.DATABASE_URL || '';
let provider = 'sqlite';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  provider = 'postgresql';
}

console.log(`[Prepare Prisma] DATABASE_URL detected. Configured provider: ${provider}`);

// Replace the provider in the datasource db block
const updatedContent = schemaContent.replace(
  /provider\s*=\s*["'](sqlite|postgresql)["']/g,
  `provider = "${provider}"`
);

fs.writeFileSync(schemaPath, updatedContent, 'utf8');
console.log(`[Prepare Prisma] Successfully configured schema.prisma for ${provider}`);
