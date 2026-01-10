import crypto from 'crypto';

console.log('\n🔐 JWT Secret Generator\n');
console.log('Copy these secrets to your .env file:\n');
console.log('JWT_ACCESS_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('\n✅ Secrets generated successfully!\n');
