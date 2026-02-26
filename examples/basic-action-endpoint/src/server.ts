import http from 'node:http';

const port = Number(process.env.PORT ?? 3001);

const payload = {
  title: 'Basic SOL Transfer',
  description: 'Send SOL to a predefined recipient',
  icon: 'https://example.com/icon.png',
  links: {
    actions: [
      {
        label: 'Send SOL',
        href: 'https://example.com/actions/send-sol',
        method: 'POST',
      },
    ],
  },
};

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, () => {
  console.log(`basic-action-endpoint listening on http://127.0.0.1:${port}`);
});
