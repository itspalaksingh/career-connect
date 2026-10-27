const dns = require('node:dns');

const endpoint = process.env.MONGODB_DOH_URL || 'https://dns.google/resolve';
const cache = new Map();

async function resolveOverHttps(name, type) {
  const key = `${type}:${name.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.records;

  const url = new URL(endpoint);
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);
  const response = await fetch(url, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`DNS-over-HTTPS returned HTTP ${response.status}.`);

  const payload = await response.json();
  if (payload.Status !== 0) throw new Error(`DNS-over-HTTPS lookup failed with status ${payload.Status}.`);

  const answers = payload.Answer || [];
  let records;
  if (type === 'SRV') {
    records = answers.filter((answer) => answer.type === 33).map(({ data }) => {
      const [priority, weight, port, target] = data.trim().split(/\s+/);
      return { priority: Number(priority), weight: Number(weight), port: Number(port), name: target.replace(/\.$/, '') };
    });
  } else if (type === 'TXT') {
    records = answers.filter((answer) => answer.type === 16).map(({ data }) => {
      const chunks = [...data.matchAll(/"(?:[^"\\]|\\.)*"/g)].map(([chunk]) => JSON.parse(chunk));
      return chunks.length ? chunks : [data];
    });
  } else {
    const expectedType = type === 'A' ? 1 : 28;
    records = answers.filter((answer) => answer.type === expectedType).map(({ data }) => data);
  }

  const ttl = answers.length ? Math.min(...answers.map((answer) => answer.TTL || 60)) : 30;
  cache.set(key, { records, expiresAt: Date.now() + ttl * 1000 });
  return records;
}

function installDnsOverHttpsFallback() {
  const originalResolve = dns.promises.resolve.bind(dns.promises);
  const originalLookup = dns.lookup.bind(dns);

  dns.promises.resolve = async (name, type) => {
    try {
      return await originalResolve(name, type);
    } catch (error) {
      if (!['SRV', 'TXT'].includes(type)) throw error;
      return resolveOverHttps(name, type);
    }
  };

  return function lookup(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const lookupOptions = typeof options === 'number' ? { family: options } : (options || {});
    originalLookup(hostname, options, (lookupError, address, family) => {
      if (!lookupError) return callback(null, address, family);

      const types = lookupOptions.family === 4 ? ['A'] : lookupOptions.family === 6 ? ['AAAA'] : ['A', 'AAAA'];
      Promise.all(types.map(async (type) => {
        const addresses = await resolveOverHttps(hostname, type);
        return addresses.map((value) => ({ address: value, family: type === 'A' ? 4 : 6 }));
      })).then((results) => {
        const addresses = results.flat();
        if (!addresses.length) return callback(lookupError);
        if (lookupOptions.all) return callback(null, addresses);
        return callback(null, addresses[0].address, addresses[0].family);
      }).catch(() => callback(lookupError));
    });
  };
}

module.exports = installDnsOverHttpsFallback;
