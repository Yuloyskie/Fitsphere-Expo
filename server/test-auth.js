const http = require('http');

const request = (method, path, body) => new Promise((resolve) => {
  const data = body ? JSON.stringify(body) : null;
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
    }
  }, (res) => {
    let out = '';
    res.on('data', c => out += c);
    res.on('end', () => {
      let parsed = {};
      try {
        parsed = out ? JSON.parse(out) : {};
      } catch {}
      resolve({ status: res.statusCode, data: parsed, raw: out });
    });
  });
  req.on('error', e => {
    console.error('REQUEST ERROR:', e.message);
    resolve({ error: e.message });
  });
  if (data) req.write(data);
  req.end();
});

(async () => {
  console.log('\n=== TESTING REGISTRATION + LOGIN ===\n');
  
  const email = 'john@test.com';
  
  console.log('1. Try login BEFORE registration:');
  let r1 = await request('POST', '/api/auth/login', { email, password: 'test123' });
  console.log(`   Status: ${r1.status} - ${r1.data.message || 'OK'}`);
  
  console.log('\n2. Register new account:');
  let r2 = await request('POST', '/api/auth/register', { fullName: 'John Doe', email, password: 'test123' });
  console.log(`   Status: ${r2.status} - ${r2.data.user ? 'User created: ' + r2.data.user.email : r2.data.message || 'ERROR'}`);
  
  console.log('\n3. Try login AFTER registration:');
  let r3 = await request('POST', '/api/auth/login', { email, password: 'test123' });
  console.log(`   Status: ${r3.status} - ${r3.data.user ? 'Login successful: ' + r3.data.user.email : 'FAILED'}`);
  
  console.log('\n4. Try login with WRONG password:');
  let r4 = await request('POST', '/api/auth/login', { email, password: 'wrongpassword' });
  console.log(`   Status: ${r4.status} - ${r4.data.message || ''}`);
  
  console.log('\n=== TEST COMPLETE ===\n');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
