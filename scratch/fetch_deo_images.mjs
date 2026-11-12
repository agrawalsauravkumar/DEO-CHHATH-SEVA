import https from 'node:https';

const url = 'https://aurangabad.bih.nic.in/tourist-place/surya-mandir-deo/';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const re = /https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)/gi;
    const matches = Array.from(new Set(data.match(re) || []));
    console.log('Images found:', matches);
  });
}).on('error', err => console.error(err));

