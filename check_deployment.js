const url = process.argv[2];
if (!url) {
  console.error('Usage: node check_deployment.js <url>');
  process.exit(1);
}

try {
  const res = await fetch(url);
  const data = await res.text();
  const secretPattern = /(key|secret|token|password)[\s]*[:=][\s]*["'][A-Za-z0-9._-]{20,}["']/i;
  if (secretPattern.test(data)) {
    console.warn('⚠️ Potential secret found in deployed HTML!');
  } else {
    console.log('✅ No obvious secrets detected in the HTML payload. HTTP status: ' + res.status);
  }
} catch (err) {
  console.error('Fetch error:', err);
}

