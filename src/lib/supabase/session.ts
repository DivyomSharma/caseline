// Signs the offline-demo session cookie so its value can't be forged by editing
// the cookie in devtools (middleware previously only checked the cookie's
// presence, not its authenticity). Uses Web Crypto so it runs in both the
// Node runtime (server actions) and the Edge runtime (middleware).

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.CASELINE_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CASELINE_SESSION_SECRET must be set in production.');
  }
  return 'caseline-dev-only-secret-do-not-use-in-production';
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Buffer.from(sig).toString('base64url');
}

export async function signSession(email: string): Promise<string> {
  const signature = await hmac(email);
  return `${email}.${signature}`;
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return null;
  const email = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  const expected = await hmac(email);
  if (signature.length !== expected.length) return null;
  // Constant-time-ish comparison; both are short base64url strings.
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0 ? email : null;
}
