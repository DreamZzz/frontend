const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'local';
const apiBaseUrl = process.argv[3];
const proxyTarget = process.argv[4] || '';

if (!apiBaseUrl) {
  console.error('Usage: node scripts/write-runtime-config.js <environment> <apiBaseUrl> [proxyTarget]');
  process.exit(1);
}

const outputPath = path.join(__dirname, '..', 'src', 'config', 'runtime.generated.js');
const content = `const runtimeConfig = {
  environment: '${environment}',
  apiBaseUrl: '${apiBaseUrl}',
  proxyTarget: '${proxyTarget}',
};

export default runtimeConfig;
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`[runtime-config] wrote ${outputPath}`);
