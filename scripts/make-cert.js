// Creates the self-signed localhost certificate Vite serves HTTPS with (certs/cert.pem, key.pem).
// Used by setup on macOS and Windows: plain Node, so no OpenSSL is needed. Keeps a valid pair,
// renews one that is missing, unreadable, mismatched or about to expire. Prints one status line.
import { X509Certificate, createPrivateKey, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'certs')
const certFile = join(dir, 'cert.pem')
const keyFile = join(dir, 'key.pem')
const VALID_DAYS = 825
const RENEW_DAYS = 7 // renewed this close to expiry, so it can't expire mid-session

/**
 * Why the existing pair can't be used, or null when it is fine.
 * @returns A short reason ("missing", "expired on …"), or null.
 */
function problemWithExisting() {
  if (!existsSync(certFile) || !existsSync(keyFile)) return 'missing'
  try {
    const cert = new X509Certificate(readFileSync(certFile))
    if (!cert.checkPrivateKey(createPrivateKey(readFileSync(keyFile)))) return 'the key does not match the certificate'
    const expires = new Date(cert.validTo)
    if (expires.getTime() - Date.now() < RENEW_DAYS * 864e5) return `expired or expiring on ${expires.toDateString()}`
    return null
  } catch (err) {
    return `unreadable (${err.message})`
  }
}

// Minimal DER encoding, just enough for one X.509 v3 certificate.
const derLength = n => {
  if (n < 0x80) return Buffer.from([n])
  const bytes = []
  for (; n; n >>= 8) bytes.unshift(n & 0xff)
  return Buffer.from([0x80 | bytes.length, ...bytes])
}
const tlv = (tag, ...parts) => {
  const body = Buffer.concat(parts)
  return Buffer.concat([Buffer.from([tag]), derLength(body.length), body])
}
const seq = (...parts) => tlv(0x30, ...parts)
const oid = text => {
  const [a, b, ...rest] = text.split('.').map(Number)
  const bytes = [40 * a + b]
  for (const n of rest) {
    const group = [n & 0x7f]
    for (let v = n >> 7; v; v >>= 7) group.unshift((v & 0x7f) | 0x80)
    bytes.push(...group)
  }
  return tlv(0x06, Buffer.from(bytes))
}
// UTCTime: YYMMDDHHMMSSZ, valid up to 2049.
const utcTime = date => tlv(0x17, Buffer.from(date.toISOString().replace(/[-:T]/g, '').slice(2, 14) + 'Z'))
const pem = (label, der) =>
  `-----BEGIN ${label}-----\n${der.toString('base64').match(/.{1,64}/g).join('\n')}\n-----END ${label}-----\n`

/**
 * Builds and signs a localhost certificate with a new RSA key.
 * @returns { cert, key } as PEM text.
 */
function createCertificate() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const sha256WithRsa = seq(oid('1.2.840.113549.1.1.11'), Buffer.from([0x05, 0x00]))
  const name = seq(tlv(0x31, seq(oid('2.5.4.3'), tlv(0x0c, Buffer.from('localhost')))))
  const serial = randomBytes(16)
  serial[0] = (serial[0] & 0x7f) | 0x40 // positive and without a leading zero byte
  const now = new Date()
  const validity = seq(utcTime(new Date(now.getTime() - 864e5)), utcTime(new Date(now.getTime() + VALID_DAYS * 864e5)))
  // subjectAltName localhost + 127.0.0.1: browsers ignore the common name.
  const altNames = seq(tlv(0x82, Buffer.from('localhost')), tlv(0x87, Buffer.from([127, 0, 0, 1])))
  const extensions = tlv(0xa3, seq(seq(oid('2.5.29.17'), tlv(0x04, altNames))))
  const tbs = seq(
    tlv(0xa0, tlv(0x02, Buffer.from([2]))), // version 3
    tlv(0x02, serial),
    sha256WithRsa,
    name,
    validity,
    name,
    publicKey.export({ type: 'spki', format: 'der' }),
    extensions,
  )
  const signature = sign('sha256', tbs, privateKey)
  const cert = seq(tbs, sha256WithRsa, tlv(0x03, Buffer.concat([Buffer.from([0]), signature])))
  return { cert: pem('CERTIFICATE', cert), key: privateKey.export({ type: 'pkcs8', format: 'pem' }) }
}

const problem = problemWithExisting()
if (!problem) {
  console.log(`present, valid until ${new Date(new X509Certificate(readFileSync(certFile)).validTo).toDateString()}`)
  process.exit(0)
}

try {
  mkdirSync(dir, { recursive: true })
  // A pair that is there but unusable is kept next to the new one, not deleted.
  for (const file of [certFile, keyFile]) if (existsSync(file)) renameSync(file, `${file}.old`)
  const { cert, key } = createCertificate()
  writeFileSync(keyFile, key, { mode: 0o600 })
  writeFileSync(certFile, cert)
  new X509Certificate(cert) // fails here rather than in Vite if the encoding were wrong
  const until = new Date(Date.now() + VALID_DAYS * 864e5).toDateString()
  console.log(problem === 'missing' ? `created, valid until ${until}` : `renewed (${problem}), valid until ${until}`)
} catch (err) {
  console.log(`failed: ${err.message}`)
  process.exit(1)
}
