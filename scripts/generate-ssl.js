/**
 * SSL Certificate Generator Script
 * Generates self-signed SSL certificates for HTTPS
 * 
 * Usage: node scripts/generate-ssl.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '..', 'ssl');

function generateSSL() {
    try {
        // Create ssl directory if it doesn't exist
        if (!fs.existsSync(sslDir)) {
            fs.mkdirSync(sslDir, { recursive: true });
            console.log('📁 Created ssl/ directory');
        }

        const keyPath = path.join(sslDir, 'server.key');
        const certPath = path.join(sslDir, 'server.crt');

        // Generate private key
        console.log('🔐 Generating private key...');
        execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

        // Generate self-signed certificate
        console.log('📜 Generating self-signed certificate...');
        execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Re-Watch/CN=localhost"`, { stdio: 'inherit' });

        console.log('\n✅ SSL certificates generated successfully!');
        console.log(`   Key: ${keyPath}`);
        console.log(`   Cert: ${certPath}`);
        console.log('\n📝 To use HTTPS, update your .env file:');
        console.log('   USE_HTTPS=true');
        console.log('   SSL_KEY_PATH=./ssl/server.key');
        console.log('   SSL_CERT_PATH=./ssl/server.crt');
        
    } catch (error) {
        console.error('❌ Failed to generate SSL certificates:');
        console.error('   Make sure OpenSSL is installed on your system.');
        console.error('   Windows: Install via Chocolatey or download from https://slproweb.com/products/Win32OpenSSL.html');
        console.error('   macOS: brew install openssl');
        console.error('   Linux: sudo apt install openssl');
        process.exit(1);
    }
}

generateSSL();
