// Checks that every direct dependency is installed at the version package-lock.json pins.
// Used by setup and start (bash and PowerShell). Exit 0 = all present, 1 = missing or out of date.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = file => JSON.parse(readFileSync(join(root, file), 'utf8'))

const pkg = readJson('package.json')
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
