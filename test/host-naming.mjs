// Exercise the Host naming route against a real index, with a temporary DSH_HOME.
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const home = await mkdtemp(join(tmpdir(), 'dem-names-'))
process.env.DSH_HOME = home
const { apply } = await import('/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market/index.js')

const index = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const LIMIT = 300
const entries = index.plugins.slice(0, LIMIT).map(entry => ({
  name: entry.name, title: entry.title, description: entry.description, category: entry.metadata?.category ?? '',
}))

// One plugin instance for the whole test, as in the running Host.
let handler = null
const ctx = {
  inject(_names, fn) { fn({ effect: f => f(), webServer: { register: route => { handler = route.handler; return () => {} } } }) },
  logger: { warn: message => console.log('warn:', message) },
}
apply(ctx)

/** Send one request through the registered route. */
function call(method, body) {
  return new Promise((resolve) => {
    const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
    const request = {
      method,
      on(event, listener) {
        if (event === 'data') for (const chunk of chunks) listener(chunk)
        if (event === 'end') listener()
        return request
      },
      destroy() {},
    }
    let status = 0
    const response = {
      headersSent: false,
      writeHead(code) { status = code; response.headersSent = true },
      end(text) { resolve({ status, body: JSON.parse(text) }) },
    }
    handler(request, response)
  })
}

const first = await call('POST', { entries })
const names = first.body.names
const chinese = Object.values(names).filter(name => /[\u4e00-\u9fff]/.test(name)).length
console.log(`POST: status ${first.status}, named ${Object.keys(names).length}, Chinese ${chinese}, added ${first.body.added}`)

const stored = JSON.parse(await readFile(join(home, 'expert-market', 'plugin-names.json'), 'utf8'))
console.log('stored on disk:', Object.keys(stored.names).length, 'identical:', JSON.stringify(stored.names) === JSON.stringify(names))

// A second request with different titles must keep every name already given.
const changed = entries.slice(0, 40).map(entry => ({ ...entry, title: 'A Completely Different Title', description: '完全不同的描述' }))
const second = await call('POST', { entries: changed })
const kept = changed.every(entry => second.body.names[entry.name] === names[entry.name])
console.log('names survive changed titles:', kept, '| recomputed:', second.body.added)

// A plugin that vanished and came back keeps its name.
const vanished = await call('POST', { entries: [{ name: entries[0].name, title: 'x', description: 'y', category: 'tools' }] })
console.log('a returning plugin keeps its name:', vanished.body.names[entries[0].name] === names[entries[0].name])

const got = await call('GET')
console.log('GET returns every stored name:', Object.keys(got.body.names).length === Object.keys(names).length)

// An empty body and a wrong method are refused without touching the record.
const bad = await call('POST', { nope: true })
console.log('a malformed body is refused:', bad.status === 400)
const wrong = await call('DELETE')
console.log('a wrong method is refused:', wrong.status === 405)

// A stored record that is not readable Chinese is dropped and given again; a good
// one is kept exactly, which is what makes a name permanent.
{
  const path = join(home, 'expert-market', 'plugin-names.json')
  const before = JSON.parse(await readFile(path, 'utf8'))
  before.names[entries[1].name] = '配置遥'
  before.names[entries[2].name] = '主题 · 主题'
  const keep = entries[3].name
  const keptName = before.names[keep]
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path, JSON.stringify(before), 'utf8')
  // A fresh instance reads the file again, as a restart would.
  const again = await import('/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market/index.js?v=2')
  let handler2 = null
  again.apply({
    inject(_n, fn) { fn({ effect: f => f(), webServer: { register: r => { handler2 = r.handler; return () => {} } } }) },
    logger: { warn() {}, info() {} },
  })
  const call2 = (method, body) => new Promise((resolve) => {
    const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
    const request = { method, on(e, l) { if (e === 'data') for (const c of chunks) l(c); if (e === 'end') l(); return request }, destroy() {} }
    const response = { headersSent: false, writeHead() { response.headersSent = true }, end(t) { resolve(JSON.parse(t)) } }
    handler2(request, response)
  })
  const healed = await call2('POST', { entries: entries.slice(0, 12) })
  console.log('a broken stored name is replaced:',
    !['配置遥', '主题 · 主题'].includes(healed.names[entries[1].name]) &&
    !['配置遥', '主题 · 主题'].includes(healed.names[entries[2].name]))
  console.log('a readable stored name is kept exactly:', healed.names[keep] === keptName)
  if (healed.names[keep] !== keptName) process.exitCode = 1
}

// The model stage: a stubbed `llm` answers a name for the batch, and only names the
// rules just invented may be replaced.
{
  const path = join(home, 'expert-market', 'plugin-names.json')
  const before = JSON.parse(await readFile(path, 'utf8'))
  // A name the model already decided is final; pick one and mark it as decided by
  // naming it in a first pass, then check a second pass leaves it alone.
  const stable = entries[1].name
  const stableName = '已定的名字'
  before.names[stable] = stableName
  before.by = { ...(before.by ?? {}), [stable]: 'model' }
  const fresh = entries[5].name
  delete before.names[fresh]
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path, JSON.stringify(before), 'utf8')

  const asked = []
  let handler3 = null
  const stub = await import('/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market/index.js?v=3')
  stub.apply({
    get(name) {
      if (name === 'llm') {
        return {
          async *stream(options) {
            const text = options.messages[0].content[0].text
            for (const line of text.split('\n')) {
              const match = /^\d+\. 包名 (\S+)/.exec(line)
              if (match !== null) asked.push(match[1])
            }
            yield { type: 'text-delta', text: JSON.stringify({ names: { [fresh]: '模型取的名字', [stable]: '不该改的名字' } }) }
            yield { type: 'finish', reason: { kind: 'stop' } }
          },
        }
      }
      if (name === 'agentDefaultModel') {
        return { currentSelection: () => ({ provider: 'p', model: 'm' }) }
      }
      return undefined
    },
    inject(_n, fn) { fn({ effect: f => f(), webServer: { register: r => { handler3 = r.handler; return () => {} } } }) },
    logger: { warn() {}, info() {} },
  })
  const call3 = (body) => new Promise((resolve) => {
    const chunks = [Buffer.from(JSON.stringify(body))]
    const request = { method: 'POST', on(e, l) { if (e === 'data') for (const c of chunks) l(c); if (e === 'end') l(); return request }, destroy() {} }
    const response = { headersSent: false, writeHead() { response.headersSent = true }, end(t) { resolve(JSON.parse(t)) } }
    handler3(request, response)
  })
  const reply = await call3({ entries: [{ name: fresh, title: 'x', description: { zh: '给工具执行前的破坏性命令做检查。' }, category: 'security' }] })
  await new Promise(resolve => setTimeout(resolve, 150))
  const after = JSON.parse(await readFile(path, 'utf8'))
  console.log('the model saw the entry:', asked.includes(fresh), asked.length)
  console.log('the model named it:', after.names[fresh] === '模型取的名字', after.names[fresh])
  // The record already holds a name for `stable` from an earlier visit, so the model
  // must not touch it even though it returned a different suggestion.
  console.log('an already stored name was left alone:', after.names[stable] === stableName, after.names[stable])
  if (after.names[stable] !== stableName) process.exitCode = 1
}

// A record whose names are rule-shaped but stamped as decided must be re-openable,
// because those names were written before the author map existed.
{
  const path = join(home, 'expert-market', 'plugin-names.json')
  const store = JSON.parse(await readFile(path, 'utf8'))
  const target = entries[2].name
  store.names[target] = '用量插件'
  store.by = store.by ?? {}
  store.by[target] = 'model'
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path, JSON.stringify(store), 'utf8')

  let handler4 = null
  const stub = await import('/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market/index.js?v=4')
  stub.apply({
    get(name) {
      if (name === 'llm') {
        return {
          async *stream() {
            yield { type: 'text-delta', text: JSON.stringify({ names: { [target]: '工作流补丁' } }) }
            yield { type: 'finish', reason: { kind: 'stop' } }
          },
        }
      }
      if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'p', model: 'm' }) }
      return undefined
    },
    inject(_n, fn) { fn({ effect: f => f(), webServer: { register: r => { handler4 = r.handler; return () => {} } } }) },
    logger: { warn() {}, info() {} },
  })
  const call4 = (body) => new Promise((resolve) => {
    const chunks = [Buffer.from(JSON.stringify(body))]
    const request = { method: 'POST', on(e, l) { if (e === 'data') for (const c of chunks) l(c); if (e === 'end') l(); return request }, destroy() {} }
    const response = { headersSent: false, writeHead() { response.headersSent = true }, end(t) { resolve(JSON.parse(t)) } }
    handler4(request, response)
  })
  await call4({ entries: [{ name: target, title: 'x', description: { zh: '找出被浪费的 CI 运行时间。' }, category: 'usage' }] })
  await new Promise(resolve => setTimeout(resolve, 200))
  const after = JSON.parse(await readFile(path, 'utf8'))
  const improved = after.names[target] === '工作流补丁' && after.by[target] === 'model'
  console.log('a rule-shaped name stamped as decided is improved once:', improved, after.names[target])
  if (!improved) process.exitCode = 1
}

// A file changed outside the plugin must be read again, not overwritten from a cached
// copy: the plugin is not the only writer a profile can have.
{
  const path = join(home, 'expert-market', 'plugin-names.json')
  const store = JSON.parse(await readFile(path, 'utf8'))
  const victim = entries[3].name
  // Remove one name and stamp the file, as another process would.
  delete store.names[victim]
  delete store.by[victim]
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path, JSON.stringify(store), 'utf8')

  let handler5 = null
  const stub = await import('/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market/index.js?v=5')
  stub.apply({
    get() { return undefined },
    inject(_n, fn) { fn({ effect: f => f(), webServer: { register: r => { handler5 = r.handler; return () => {} } } }) },
    logger: { warn() {}, info() {} },
  })
  const read5 = () => new Promise((resolve) => {
    const req = { method: 'GET', on(e, l) { if (e === 'end') l(); return req }, destroy() {} }
    const res = { headersSent: false, writeHead() { res.headersSent = true }, end(t) { resolve(JSON.parse(t)) } }
    handler5(req, res)
  })
  const answer = await read5()
  console.log('an external edit is seen by a fresh read:', answer.names[victim] === undefined,
    String(answer.names[victim]))
  if (answer.names[victim] !== undefined) process.exitCode = 1
}

await rm(home, { recursive: true, force: true })
const ok = Object.keys(names).length === LIMIT && chinese === LIMIT && kept && second.body.added === 0 && bad.status === 400
console.log(ok ? '\nHOST OK' : '\nHOST PROBLEM')
if (!ok) process.exitCode = 1
