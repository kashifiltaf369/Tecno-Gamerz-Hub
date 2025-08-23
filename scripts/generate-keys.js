#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate JWT key pairs for development
 * This script generates secure RSA key pairs for JWT signing
 */

function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

function generateSecretKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function main() {
  console.log('🔐 Generating JWT key pairs for Tecno Gamerz Hub...\n');

  try {
    // Generate access token key pair
    console.log('Generating access token key pair...');
    const accessKeys = generateKeyPair();
    
    // Generate refresh token key pair
    console.log('Generating refresh token key pair...');
    const refreshKeys = generateKeyPair();
    
    // Generate NextAuth secret
    console.log('Generating NextAuth secret...');
    const nextAuthSecret = generateSecretKey(32);
    
    // Generate simple secrets for development
    console.log('Generating development secrets...');
    const jwtAccessSecret = generateSecretKey(32);
    const jwtRefreshSecret = generateSecretKey(32);

    // Create keys directory
    const keysDir = path.join(__dirname, '..', 'keys');
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    // Write key files
    fs.writeFileSync(path.join(keysDir, 'jwt-access-private.pem'), accessKeys.privateKey);
    fs.writeFileSync(path.join(keysDir, 'jwt-access-public.pem'), accessKeys.publicKey);
    fs.writeFileSync(path.join(keysDir, 'jwt-refresh-private.pem'), refreshKeys.privateKey);
    fs.writeFileSync(path.join(keysDir, 'jwt-refresh-public.pem'), refreshKeys.publicKey);

    // Create environment file with secrets
    const envContent = `
# JWT Key Pairs (for production, use environment variables)
JWT_ACCESS_PRIVATE_KEY="${accessKeys.privateKey.replace(/\n/g, '\\n')}"
JWT_ACCESS_PUBLIC_KEY="${accessKeys.publicKey.replace(/\n/g, '\\n')}"
JWT_REFRESH_PRIVATE_KEY="${refreshKeys.privateKey.replace(/\n/g, '\\n')}"
JWT_REFRESH_PUBLIC_KEY="${refreshKeys.publicKey.replace(/\n/g, '\\n')}"

# Simple secrets for development
JWT_ACCESS_SECRET="${jwtAccessSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Generated on: ${new Date().toISOString()}
`;

    fs.writeFileSync(path.join(__dirname, '..', '.env.keys'), envContent.trim());

    // Update .env.example with placeholders
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    let envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    // Add JWT configuration if not present
    if (!envExample.includes('JWT_ACCESS_SECRET')) {
      envExample += `

# JWT Configuration (generate with: pnpm keys:generate)
JWT_ACCESS_SECRET="your-jwt-access-secret-here"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# JWT Key Pairs (optional, for advanced JWT usage)
# JWT_ACCESS_PRIVATE_KEY="your-rsa-private-key-here"
# JWT_ACCESS_PUBLIC_KEY="your-rsa-public-key-here"
# JWT_REFRESH_PRIVATE_KEY="your-rsa-private-key-here"
# JWT_REFRESH_PUBLIC_KEY="your-rsa-public-key-here"
`;
      fs.writeFileSync(envExamplePath, envExample);
    }

    // Create .gitignore entries for keys
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    let gitignore = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignore.includes('.env.keys')) {
      gitignore += `
# Generated keys and secrets
.env.keys
keys/
*.pem
`;
      fs.writeFileSync(gitignorePath, gitignore);
    }

    console.log('\n✅ JWT key pairs generated successfully!');
    console.log('\n📁 Files created:');
    console.log('   - keys/jwt-access-private.pem');
    console.log('   - keys/jwt-access-public.pem');
    console.log('   - keys/jwt-refresh-private.pem');
    console.log('   - keys/jwt-refresh-public.pem');
    console.log('   - .env.keys');
    console.log('\n📝 Updated:');
    console.log('   - .env.example');
    console.log('   - .gitignore');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Copy secrets from .env.keys to your .env file');
    console.log('   2. Add production secrets to your deployment environment');
    console.log('   3. Store private keys securely in production');
    console.log('\n⚠️  Security Notes:');
    console.log('   - Never commit .env.keys or keys/ directory');
    console.log('   - Use environment variables in production');
    console.log('   - Rotate keys regularly in production');
    console.log('   - Use HSM or key management services for production keys');

  } catch (error) {
    console.error('❌ Error generating keys:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateKeyPair, generateSecretKey };