/**
 * Offline test of the Host naming rules against real market indexes.
 *
 * The naming functions live in `index.js` beside the route that persists their
 * result, so the test loads that module's naming half by evaluating the file up
 * to the storage section: it exercises exactly the code the route runs.
 */
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8')
const upToStorage = source.slice(0, source.indexOf('// ---------------------------------------------------------------- storage'))
const naming = new Function(`${upToStorage.replace(/^import .*$/gm, '').replace('export function apply', 'function apply')}
return { chineseName, functionName, headWord, tokens, textOf }`)()

const CJK = /[\u4e00-\u9fff]/
let total = 0
const failures = []
const shown = []

for (const file of process.argv.slice(2)) {
  const index = JSON.parse(readFileSync(file, 'utf8'))
  for (const entry of index.plugins) {
    total += 1
    const name = naming.chineseName({
      name: entry.name,
      title: entry.title,
      description: entry.description,
      category: entry.metadata?.category ?? '',
    })
    if (!CJK.test(name)) failures.push(['not Chinese', entry.name, name])
    else if (name.length < 2) failures.push(['too short', entry.name, name])
    else if (name.length > 12) failures.push(['too long', entry.name, name])
    else if (/^[的了着过已并]/.test(name)) failures.push(['leading particle', entry.name, name])
    else if (name.length >= 4 && /(的|多个|每个|任意)$/.test(name)) failures.push(['truncated', entry.name, name])
    else if (shown.length < 24) shown.push([entry.name, name])
  }
}

console.log(`entries: ${total}`)
console.log(`failures: ${failures.length}`)
for (const row of failures.slice(0, 20)) console.log('  ', row.join(' | '))
console.log('--- samples')
for (const [raw, name] of shown) console.log(`   ${raw} -> ${name}`)

// Stability: the same entry always yields the same name.
const sample = JSON.parse(readFileSync(process.argv[2], 'utf8')).plugins.slice(0, 50)
const first = sample.map(entry => naming.chineseName({ name: entry.name, title: entry.title, description: entry.description, category: entry.metadata?.category ?? '' }))
const second = sample.map(entry => naming.chineseName({ name: entry.name, title: entry.title, description: entry.description, category: entry.metadata?.category ?? '' }))
const stable = first.every((name, at) => name === second[at])
console.log(`stable for the same input: ${stable}`)
if (failures.length > 0 || !stable) process.exitCode = 1
