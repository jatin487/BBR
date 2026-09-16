// check_deployment.js
// Fetch the deployed URL and scan HTML for potential secrets
const https = require('https');
const url = process.argv[2];
if (!url) {
  console.error('Usage: node check_deployment.js <url>');
  process.exit(1);
}
https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const secretPattern = /(key|secret|token|password)[\s]*[:=][\s]*["'][A-Za-z0-9._-]{20,}["']/i;
    if (secretPattern.test(data)) {
      console.warn('⚠️ Potential secret found in deployed HTML!');
    } else {
      console.log('✅ No obvious secrets detected in the HTML payload.');
    }
  });
});
