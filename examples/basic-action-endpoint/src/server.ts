import http from 'node:http';

export const basicActionPayload = {
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

export function createBasicActionServer(): http.Server {
  return http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(basicActionPayload));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });
}

export async function startBasicActionServer(
  port = Number(process.env.PORT ?? 3001),
  server = createBasicActionServer(),
): Promise<http.Server> {

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`basic-action-endpoint listening on http://127.0.0.1:${port}`);
      resolve();
    });
  });

  return server;
}

if (require.main === module) {
  void startBasicActionServer();
}
