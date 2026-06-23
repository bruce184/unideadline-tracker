import crypto from 'crypto'

function getSecret() {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET
  if (!secret) throw new Error('Missing GOOGLE_OAUTH_STATE_SECRET')
  return secret
}

export function signState(userId) {
  const payload = JSON.stringify({ userId, ts: Date.now() })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url')
  return `${payloadB64}.${signature}`
}

export function verifyState(state) {
  if (!state || !state.includes('.')) return null

  const [payloadB64, signature] = state.split('.')
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url')

  if (signature !== expected) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    const expired = Date.now() - payload.ts > 10 * 60 * 1000
    return expired ? null : payload.userId
  } catch {
    return null
  }
}