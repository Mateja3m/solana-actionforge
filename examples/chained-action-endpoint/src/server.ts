import http from 'node:http';

import {
  createChainState,
  decodeState,
  encodeState,
  enforceExpiry,
  enforceMaxSteps,
  nextStep,
} from '@idoa/actionforge-chain';

const port = Number(process.env.PORT ?? 3002);

function buildPayload(stateToken: string) {
  return {
    title: 'Chained Swap Flow',
    description: 'Demonstrates safe-by-default chain state helpers',
    icon: 'https://example.com/chained-icon.png',
    links: {
      actions: [
        {
          label: 'Continue',
          href: `/next?state=${encodeURIComponent(stateToken)}`,
          method: 'POST',
        },
      ],
    },
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);

  if (url.pathname === '/' && req.method === 'GET') {
    const initial = createChainState({ ttlMs: 60_000, maxSteps: 3 });
    const encoded = encodeState(initial);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(buildPayload(encoded)));
    return;
  }

  if (url.pathname === '/next' && req.method === 'POST') {
    try {
      const stateParam = url.searchParams.get('state');
      if (!stateParam) {
        throw new Error('missing state query parameter');
      }

      const decoded = decodeState(stateParam);
      enforceExpiry(decoded);
      enforceMaxSteps(decoded);
      const updated = nextStep(decoded, { route: '/next' });
      const encoded = encodeState(updated);

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(buildPayload(encoded)));
      return;
    } catch (error) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'invalid_chain_state',
          detail: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
      return;
    }
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, () => {
  console.log(`chained-action-endpoint listening on http://127.0.0.1:${port}`);
});
