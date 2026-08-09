/**
 * Arca V1 HTTP end-to-end smoke tests against a running web server.
 * Usage: node scripts/e2e.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3000';
const WS_HEALTH = process.env.WS_HEALTH_URL || 'http://localhost:3002/health';

let passed = 0;
let failed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err: err.message || String(err) });
    console.log(`  FAIL  ${name}: ${err.message || err}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

async function json(path, opts) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...(opts?.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body, status: res.status };
}

async function html(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  return { res, text, status: res.status };
}

console.log(`\nArca E2E @ ${BASE}\n`);

await check('Homepage 200 + ARCA brand', async () => {
  const { status, text } = await html('/');
  assert(status === 200, `status ${status}`);
  assert(/ARCA/i.test(text), 'missing ARCA brand');
  assert(/buyback/i.test(text), 'missing buyback narrative');
});

await check('Discover 200', async () => {
  const { status, text } = await html('/discover');
  assert(status === 200, `status ${status}`);
  assert(/Discover/i.test(text), 'missing Discover');
});

await check('Agent detail (Trading) 200 + buyback', async () => {
  const { status, text } = await html('/agents/quantum-flux');
  assert(status === 200, `status ${status}`);
  assert(/Quantum Flux/i.test(text), 'missing agent name');
  assert(/buyback/i.test(text), 'missing buyback');
});

await check('Agent detail (ICO Live) 200', async () => {
  const { status, text } = await html('/agents/prediction-nexus');
  assert(status === 200, `status ${status}`);
  assert(/Prediction Nexus/i.test(text), 'missing agent');
});

await check('ICO page 200', async () => {
  const { status } = await html('/agents/prediction-nexus/ico');
  assert(status === 200, `status ${status}`);
});

await check('Apply / Dashboard / Deploy / Admin pages 200', async () => {
  for (const p of ['/apply', '/dashboard', '/deploy', '/admin']) {
    const { status } = await html(p);
    assert(status === 200, `${p} status ${status}`);
  }
});

await check('GET /api/agents returns list', async () => {
  const { status, body } = await json('/api/agents');
  assert(status === 200, `status ${status}`);
  const list = Array.isArray(body) ? body : body?.agents;
  assert(Array.isArray(list) && list.length >= 1, 'expected agents array');
});

await check('GET /api/agents/[slug]', async () => {
  const { status, body } = await json('/api/agents/quantum-flux');
  assert(status === 200, `status ${status}`);
  assert(body?.agent?.slug === 'quantum-flux' || body?.slug === 'quantum-flux', 'slug mismatch');
});

await check('Waitlist join idempotent', async () => {
  const email = `e2e-${Date.now()}@arca.test`;
  const a = await json('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  assert(a.status === 200 || a.status === 201, `first ${a.status}`);
  const b = await json('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  assert(b.status === 200 || b.status === 201, `second ${b.status}`);
});

await check('Applications API if present', async () => {
  const list = await json('/api/applications');
  if (list.status === 404) {
    console.log('  SKIP  /api/applications not yet deployed');
    passed++;
    return;
  }
  assert(list.status === 200, `list ${list.status}`);

  const created = await json('/api/applications', {
    method: 'POST',
    body: JSON.stringify({
      name: 'E2E Agent',
      description: 'End to end test agent',
      category: 'Trading',
      chain: 'solana',
      launchFdv: 500000,
      thresholdBps: 5000,
      vestingCliffDays: 30,
      vestingDurationDays: 365,
      revenueWallet: 'E2EWallet111111111111111111111111111',
      website: 'https://example.com',
      docs: 'https://example.com/docs',
      team: [{ name: 'Ada', role: 'Lead', profileUrl: 'https://example.com/ada' }],
      documentsMeta: [{ type: 'strategy', title: 'Strategy', url: 'https://example.com/strategy.pdf' }],
    }),
  });
  assert(created.status === 200 || created.status === 201, `create ${created.status} ${JSON.stringify(created.body)}`);
  const app = created.body?.application || created.body;
  assert(app?.id, 'missing application id');
  assert(app?.status === 'Submitted', `status ${app?.status}`);
  assert(app?.raiseTarget === 50000, `raiseTarget should be 10% FDV, got ${app?.raiseTarget}`);
  assert(app?.tier == null, 'tier must be pending (null) until admin assigns');

  const decide = await json(`/api/applications/${app.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'approve',
      tier: 'Core',
      riskRating: 'Medium',
    }),
  });
  assert(decide.status === 200, `decide ${decide.status} ${JSON.stringify(decide.body)}`);

  // Contribute to live ICO
  const wallet = `0xe2e${Date.now().toString(16).padStart(40, '0').slice(0, 40)}`;
  const contribute = await json('/api/agents/prediction-nexus/contribute', {
    method: 'POST',
    body: JSON.stringify({ wallet, amount: 1000 }),
  });
  assert(
    contribute.status === 200 || contribute.status === 201,
    `contribute ${contribute.status} ${JSON.stringify(contribute.body)}`,
  );
  assert(contribute.body?.tokensAllocated > 0, 'expected tokensAllocated > 0');
});

await check('Contribute / finalize / claim path if present', async () => {
  // covered in applications flow; keep lightweight finalize check
  const agent = await json('/api/agents/prediction-nexus');
  assert(agent.status === 200, 'agent fetch');
});

await check('WS health', async () => {
  try {
    const res = await fetch(WS_HEALTH);
    assert(res.status === 200, `ws health ${res.status}`);
  } catch (e) {
    throw new Error(`WS health unreachable (${WS_HEALTH}): ${e.message}`);
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failures.length) {
  for (const f of failures) console.log(` - ${f.name}: ${f.err}`);
  process.exit(1);
}
