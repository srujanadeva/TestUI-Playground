// Creates server/.env from server/.env.example with a random JWT secret, or adds the keys that
// a newer .env.example has and the existing .env lacks. Existing values are never changed.
// Used by setup on macOS and Windows. Prints one status line.
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'server')
const envFile = join(serverDir, '.env')
const exampleFile = join(serverDir, '.env.example')

/**
 * The KEY=value lines of an env file, in order.
 * @param text File contents.
 * @returns Array of [key, line].
 */
function entries(text) {
  return text.split(/\r?\n/).flatMap(line => {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)
    return m ? [[m[1], line]] : []
  })
}

/** The example's line for a key, with a fresh secret in place of the placeholder JWT_SECRET. */
const withSecret = (key, line) => (key === 'JWT_SECRET' ? `JWT_SECRET=${randomBytes(32).toString('hex')}` : line)

try {
  const example = entries(readFileSync(exampleFile, 'utf8'))
  if (!existsSync(envFile)) {
    // No BOM: dotenv would read it as part of the first key's name.
    writeFileSync(envFile, example.map(([key, line]) => withSecret(key, line)).join('\n') + '\n')
    console.log('created, with a generated JWT_SECRET')
    process.exit(0)
  }
  const current = readFileSync(envFile, 'utf8')
  const have = new Set(entries(current).map(([key]) => key))
  const missing = example.filter(([key]) => !have.has(key))
  if (!missing.length) {
    console.log('present')
    process.exit(0)
  }
  const prefix = current === '' || current.endsWith('\n') ? '' : '\n'
  appendFileSync(envFile, prefix + missing.map(([key, line]) => withSecret(key, line)).join('\n') + '\n')
  console.log(`added ${missing.map(([key]) => key).join(', ')}`)
} catch (err) {
  console.log(`failed: ${err.message}`)
  process.exit(1)
}
