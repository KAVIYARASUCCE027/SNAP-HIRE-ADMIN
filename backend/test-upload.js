const fs = require('fs');
const http = require('http');

// Make a valid blank PDF payload (minimal valid PDF)
const pdfBytes = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000223 00000 n \n0000000318 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n406\n%%EOF',
  'ascii'
);
fs.writeFileSync('sample.pdf', pdfBytes);

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let postData = '';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="name"\r\n\r\nTest User\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="email"\r\n\r\ntest@example.com\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="role"\r\n\r\nEngineer\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="requiredSkills"\r\n\r\nNode, React\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="resumeFile"; filename="sample.pdf"\r\n';
postData += 'Content-Type: application/pdf\r\n\r\n';

const footer = '\r\n--' + boundary + '--\r\n';

const payload = Buffer.concat([
  Buffer.from(postData, 'utf8'),
  pdfBytes,
  Buffer.from(footer, 'utf8')
]);

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/resumes',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': payload.length
  }
}, res => {
  let output = '';
  res.on('data', d => output += d);
  res.on('end', () => console.log('HTTP Status:', res.statusCode, 'Response:', output));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
