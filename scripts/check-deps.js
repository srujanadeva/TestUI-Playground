// Checks that the running Node matches package.json "engines", that every direct dependency
// is installed at the version package-lock.json pins, and that Vite's native part was built
// for this computer. Used by setup and start. Exit 0 = good, 1 = packages missing or out of
// date, 2 = Node too old, 3 = packages installed for another processor or system.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
/** Reads and parses a JSON file given relative to the project root. */
const readJson = file => JSON.parse(readFileSync(join(root, file), 'utf8'))

const pkg = readJson('package.json')

/**
 * Whether a Node version falls inside an "engines" range.
 * Understands the forms used in "engines": "^X.Y.Z", ">=X.Y.Z", joined with "||".
 * Anything else is not checked, so an unfamiliar range never blocks a start.
 * @param range The `engines.node` value from package.json.
 * @param version A version such as `process.version` ("v22.12.0").
 * @returns true if any part of the range is satisfied.
 */
function nodeSatisfies(range, version) {
  const parse = v => v.replace(/^v/, '').split('.').map(Number)
  // Compares [major, minor, patch]: negative, zero or positive, like a sort comparator.
  const atLeast = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
  const have = parse(version)
  return range.split('||').map(part => part.trim()).some(part => {
    const m = /^(\^|>=)\s*(\d+)\.(\d+)\.(\d+)$/.exec(part)
    if (!m) return true
    const want = [Number(m[2]), Number(m[3]), Number(m[4])]
    // A caret range also caps the major version: ^20.19.0 does not accept 21.
    if (m[1] === '^' && have[0] !== want[0]) return false
    return atLeast(have, want) >= 0
  })
}

const nodeRange = pkg.engines?.node
if (nodeRange && !nodeSatisfies(nodeRange, process.version)) {
  console.log(`Node ${process.version} (${process.execPath}) is too old for this project; it needs ${nodeRange}.`)
  process.exit(2)
}

const lock = readJson('package-lock.json')
const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })

const problems = []
for (const name of names) {
  const wanted = lock.packages?.[`node_modules/${name}`]?.version
  let installed
  try {
    installed = readJson(`node_modules/${name}/package.json`).version
  } catch {
    problems.push(`${name} (not installed)`)
    continue
  }
  if (wanted && installed !== wanted) problems.push(`${name} (installed ${installed}, needs ${wanted})`)
}

if (problems.length) {
  console.log(`Missing or out-of-date npm packages: ${problems.join(', ')}`)
  process.exit(1)
}

// Vite's bundler is a native binary chosen at install time. node_modules copied from another
// computer, or installed by a Node of another architecture (Rosetta), has the wrong one.
try {
  await import('rolldown')
} catch (err) {
  console.log(`The npm packages were installed for another computer (this one is ${process.platform}-${process.arch}): ${err.message.split('\n')[0]}`)
  process.exit(3)
}
