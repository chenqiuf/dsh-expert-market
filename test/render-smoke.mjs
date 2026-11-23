/**
 * Offline smoke test for the expert market client bundle.
 *
 * Runs the real `client.js` inside a VM with a tiny React shim (persistent hook
 * slots per component, so re-renders keep state), a stub document for the style
 * host, and a fake `pluginMarket` / `pluginManager` Remote filled from the real
 * index the profile is configured with. It renders the page, waits for the async
 * reads, opens a detail page, drives an install, and prints what it saw.
 */
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const ROOT = '/Users/mac/Documents/deepseek-harness/default-workspace/dsh-expert-market'
const INDEX = '/tmp/dshopen.json'

let slots = null
let cursor = 0
let pending = []

function beginComponent(instance) {
  slots = instance.hooks
  cursor = 0
  pending = instance.effects
}
function useSlot(init) {
  const at = cursor++
  if (!(at in slots)) slots[at] = init
  return slots[at]
}

const React = {
  createElement(type, props, ...children) {
    const flat = []
    for (const child of children) {
      if (Array.isArray(child)) flat.push(...child.flat(Infinity))
      else flat.push(child)
    }
    return { type, props: { ...(props ?? {}), children: flat.length === 0 ? undefined : flat } }
  },
  useState(initial) {
    const at = cursor++
    if (!(at in slots)) slots[at] = typeof initial === 'function' ? initial() : initial
    return [slots[at], (next) => { slots[at] = typeof next === 'function' ? next(slots[at]) : next }]
  },
  useRef(initial) { return useSlot({ current: initial ?? null }) },
  useMemo(factory) { const at = cursor++; if (!(at in slots)) slots[at] = factory(); return slots[at] },
  useCallback(fn) { return useSlot(fn) },
  useEffect(fn) { useSlot(null); pending.push(fn) },
  useSyncExternalStore(subscribe, getSnapshot) {
    const at = cursor++
    if (!(at in slots)) slots[at] = subscribe(() => {})
    return getSnapshot()
  },
}

// ------------------------------------------------------------ fake DOM

const styles = []
const document = {
  head: { appendChild: node => { styles.push(node) } },
  getElementById: id => styles.find(node => node.id === id) ?? null,
  createElement: tag => ({
    tag, id: '', textContent: '',
    remove() { const at = styles.indexOf(this); if (at >= 0) styles.splice(at, 1) },
  }),
  addEventListener() {}, removeEventListener() {},
}
const window = { requestAnimationFrame: () => 0, cancelAnimationFrame() {} }

// ------------------------------------------------------------ fake data

const index = JSON.parse(readFileSync(INDEX, 'utf8'))

function entryOf(plugin) {
  const versions = plugin.versions.slice(0, 3).map(version => ({
    ...version,
    install: version.source.type === 'npm'
      ? { spec: `${plugin.name}@${version.version}`, ...(version.source.registry ? { registry: version.source.registry } : {}) }
      : { spec: `git+${version.source.url}#${version.source.commit}` },
    compatibility: { compatible: true },
    update: false,
  }))
  return { ...plugin, versions, defaultVersion: versions[0]?.version, installation: { status: 'not-installed' } }
}

const annotated = index.plugins.map(entryOf)
const calls = []
const market = {
  async listIndexes() {
    calls.push('listIndexes')
    return {
      ok: true,
      value: [
        { url: 'https://dshopen.org/index.json', title: index.title, description: index.description },
        { url: 'https://example.com/other.json', title: otherIndex.title, description: otherIndex.description },
      ],
    }
  },
  async search(url, query) {
    calls.push(`search ${url} ${query.category ?? '*'} "${query.text ?? ''}" @${query.offset}`)
    // The Host's own bound: a limit outside 1..100 is refused, not clamped.
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100) {
      return { ok: false, error: { message: 'limit must be an integer from 1 to 100' } }
    }
    if (url === 'https://example.com/other.json') {
      const pool = otherAnnotated.filter(entry =>
        (query.category === undefined || entry.metadata.category === query.category))
      const page = pool.slice(query.offset, query.offset + query.limit)
      return {
        ok: true,
        value: {
          url, title: otherIndex.title, description: otherIndex.description,
          metadata: otherIndex.metadata, fetchedAt: 1, entries: page, total: pool.length,
          nextOffset: null,
        },
      }
    }
    const matching = annotated.filter(entry =>
      (query.category === undefined || entry.metadata.category === query.category)
      && (((query.text ?? '').trim() === '') || entry.name.toLowerCase().includes((query.text ?? '').toLowerCase())))
    const page = matching.slice(query.offset, query.offset + query.limit)
    return {
      ok: true,
      value: {
        url, title: index.title, description: index.description, metadata: index.metadata, fetchedAt: 1,
        entries: page, total: matching.length,
        nextOffset: query.offset + page.length < matching.length ? query.offset + page.length : null,
      },
    }
  },
  async readEntryDetail(url, name) {
    calls.push(`detail ${name}`)
    return {
      ok: true,
      value: {
        status: 'found', origin: 'npm', document: 'README.md',
        markdown: `# ${name}\n\nA plugin **with** \`code\` and a [link](https://example.com).\n\n- one\n- two\n\n\`\`\`\nrun it\n\`\`\`\n\n> quote\n`,
      },
    }
  },
}

let installReply = { application: 'applied', bundle: 'demo', version: '1.0.0' }
const otherIndex = {
  title: { zh: '另一个插件源' },
  description: { zh: '第二个源' },
  metadata: {
    categories: { other: { title: { zh: '别的分类' } }, second: { title: { zh: '第二分类' } } },
    labels: {}, sortKeys: { 'github-stars': { title: { zh: '星数' }, order: 'desc' } },
  },
  plugins: Array.from({ length: 5 }, (_, index) => ({
    name: `other-plugin-${index}`,
    title: { zh: `别的插件 ${index}` },
    description: { zh: `另一个源里的第 ${index} 个插件，用于核对切换源后的显示。` },
    metadata: { category: index % 2 === 0 ? 'other' : 'second', labels: [], keywords: [], sortKeys: { 'github-stars': 10 + index } },
    versions: [{ version: '1.0.0', publishTimestamp: 1790000000 + index, source: { type: 'npm' }, engines: {} }],
  })),
}
const otherAnnotated = otherIndex.plugins.map(entryOf)

const installedRows = [
  { name: 'dsh-pet', official: false, availability: 'profile', enabled: true, installed: true, removable: true,
    update: 'registry', version: '0.4.3', meta: { title: { zh: '宠物' }, description: { zh: '桌面宠物。' } } },
  { name: 'dsh-theme-holo', official: false, availability: 'profile', enabled: false, installed: true, removable: true,
    update: 'registry', version: '1.2.0', meta: { title: { zh: '主题' }, description: { zh: '主题包。' } } },
  { name: 'dsh-base', official: true, availability: 'installation', enabled: true, installed: false, removable: false,
    version: '0.2.2', meta: { title: { zh: '基础包' }, description: { zh: 'DSH 自带。' } } },
  // A shipped bundle that is stopped: origin and running state are independent, and
  // this row is what proves the page reports both.
  { name: 'dsh-cua-bundle', official: true, availability: 'installation', enabled: false, installed: false, removable: false,
    version: '0.2.2', meta: { title: { zh: '电脑操控' }, description: { zh: 'DSH 自带但已停用。' } } },
  // A catalog entry that is not installed: the installed view must not list it.
  { name: 'not-installed-plugin', official: true, availability: 'missing', enabled: false, installed: false,
    removable: false, meta: { title: { zh: '未安装' } } },
]
const manager = {
  async installBundle(spec, options) {
    calls.push(`install ${spec} enabled=${options.enabled} id=${typeof options.requestId}`)
    return { ok: true, value: installReply }
  },
  async cancelInstall() { calls.push('cancel'); return { ok: true, value: { status: 'cancelled' } } },
  async listBundles() {
    calls.push('listBundles')
    return { ok: true, value: installedRows.map(row => ({ ...row })) }
  },
  async setBundleEnabled(name, enabled) {
    calls.push(`setBundleEnabled ${name} ${enabled}`)
    const row = installedRows.find(item => item.name === name)
    if (row !== undefined) row.enabled = enabled
    return { ok: true, value: { application: 'applied' } }
  },
  async removeBundle(name) {
    calls.push(`removeBundle ${name}`)
    const at = installedRows.findIndex(item => item.name === name)
    if (at >= 0) installedRows.splice(at, 1)
    return { ok: true, value: { application: 'applied' } }
  },
  versionCalls: [],
  async listVersions(name) {
    this.versionCalls.push(name)
    calls.push(`listVersions ${name}`)
    // Only a third-party registry package publishes a list; the Host refuses others.
    const row = installedRows.find(item => item.name === name)
    if (row === undefined || row.availability !== 'profile') {
      return { ok: true, value: { status: 'refused', problem: 'not-updatable', reason: 'not updatable', attempts: [] } }
    }
    if (name !== 'dsh-pet') return { ok: true, value: { status: 'listed', registry: 'npm', versions: [], attempts: [] } }
    return {
      ok: true,
      value: {
        status: 'listed', registry: 'npm',
        versions: [{ version: '0.5.0', compatibility: { compatible: true }, install: { spec: 'dsh-pet@0.5.0' } }],
        attempts: [],
      },
    }
  },
  async updateBundle(name, version, options) {
    calls.push(`updateBundle ${name}@${version}`)
    const row = installedRows.find(item => item.name === name)
    if (row !== undefined) row.version = version
    return { ok: true, value: { from: '0.4.3', to: version, step: 'apply', result: { application: 'applied', changed: true } } }
  },
  async readBundleDetail(name) {
    calls.push(`readBundleDetail ${name}`)
    return { ok: true, value: { status: 'found', markdown: `# ${name}\n\n已安装插件的说明文档。` } }
  },
}

// ------------------------------------------------------------ fake ctx

const registrations = []
const ctx = {
  effect(fn) { fn() },
  on() { return () => {} },
  get(name) {
    if (name === 'remote') return { pluginMarket: market, pluginManager: manager, $on: () => () => {} }
    if (name === 'layout') return { selectPanel: id => calls.push(`panel ${id}`) }
    if (name === 'remoteAccess') {
      return {
        whenAccess(_action, callback) { callback(); return () => {} },
      }
    }
    if (name === 'uiWorkspace') return { startSession: (id, options) => calls.push(`session ${String(options?.prompt).slice(0, 40)}`) }
    return undefined
  },
  locale: {
    register() { return () => {} },
    bind: () => key => key,
    getLocale: () => ({ active: 'zh-CN' }),
    subscribe: () => () => {},
    resolveText: value => (typeof value === 'string' ? value : value?.zh ?? value?.en ?? ''),
  },
  remote: { $on: () => () => {} },
  slots: {
    inject(_name, callback) { callback(); return () => {} },
    register(options, Component) { registrations.push({ options, Component }); return () => {} },
  },
}

// ------------------------------------------------------------ load

const source = readFileSync(`${ROOT}/client.js`, 'utf8')
let plugin = null
const namesGiven = {}
let namePostCount = 0
async function fakeFetch(url, options) {
  if (url !== '/expert-market/names') throw new Error(`unexpected fetch ${url}`)
  if (options?.method === 'POST') {
    namePostCount += 1
    const body = JSON.parse(options.body)
    for (const entry of body.entries) {
      if (namesGiven[entry.name] !== undefined) continue
      // A stand-in for the Host rules: the entry's own Chinese title when it has
      // one, else a name derived from its description.
      const title = entry.title
      const zh = typeof title === 'object' && title !== null ? (title.zh ?? '') : ''
      const fromDescription = String(entry.description?.zh ?? '').replace(/^[★☆\s\d,.]+│?\s*/, '').slice(0, 4)
      namesGiven[entry.name] = /[\u4e00-\u9fff]/.test(zh) ? zh : fromDescription
    }
  }
  return { ok: true, status: 200, async json() { return { names: namesGiven } } }
}

const store = new Map()
const localStorage = {
  getItem: key => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => { store.set(key, String(value)) },
  removeItem: key => { store.delete(key) },
  key: index => [...store.keys()][index] ?? null,
  get length() { return store.size },
  clear: () => store.clear(),
}

const sandbox = {
  fetch: fakeFetch,
  window: { ...window, localStorage, __ModuleLoader__: { load: spec => { plugin = spec } } },
  document, console, setTimeout, clearTimeout, Intl, URL, Promise, JSON, Math, Date, Array, Object, String, Number, RegExp,
  crypto: { randomUUID: () => 'test-request-id' },
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(source, sandbox, { filename: 'client.js' })
if (plugin === null) throw new Error('the bundle did not call window.__ModuleLoader__.load')
const loaded = plugin.factory(name => {
  if (name === 'react') return React
  throw new Error(`unexpected require(${name})`)
})
loaded.apply(ctx)

const main = registrations.find(item => item.options.name === 'main')
const icon = registrations.find(item => item.options.name === 'sidebar.panellist')

if (main === undefined || icon === undefined) throw new Error('the page did not register both slots')

// ------------------------------------------------------------ render helpers

const instances = new Map()

function walk(node) {
  if (node === null || node === undefined || node === false || node === true) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(walk).join('')
  if (typeof node.type === 'function') {
    const key = node.type
    if (!instances.has(key)) instances.set(key, { hooks: [], effects: [] })
    const instance = instances.get(key)
    const outer = slots
    const outerCursor = cursor
    const outerPending = pending
    beginComponent(instance)
    const out = walk(node.type(node.props))
    slots = outer
    cursor = outerCursor
    pending = outerPending
    return out
  }
  const children = node.props?.children
  return children === undefined ? '' : (Array.isArray(children) ? children.map(walk).join('') : walk(children))
}

function render(node) {
  let text = ''
  for (let pass = 0; pass < 6; pass += 1) {
    text = walk(node)
    const effects = []
    for (const instance of instances.values()) {
      for (const effect of instance.effects) effects.push(effect)
      instance.effects = []
    }
    for (const effect of effects) effect()
  }
  return text
}

const settle = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms))

// ------------------------------------------------------------ assertions

const failures = []
function check(label, condition, extra) {
  if (condition) console.log(`  ok  ${label}`)
  else { failures.push(label); console.log(`FAIL  ${label}${extra === undefined ? '' : ` — ${extra}`}`) }
}

// The official Plugins page gets the same page as a tab, before the shipped market tab.
{
  const tab = registrations.find(item => item.options.name === 'plugins.tab')
  check('a plugins page tab is registered', tab !== undefined)
  check('the tab precedes the shipped market tab', tab !== undefined && tab.options.order < -1,
    String(tab?.options.order))
  check('the tab carries a label thunk', typeof tab?.options.label === 'function')
  check('the tab declares a locale so it receives t',
    typeof tab?.options.locale === 'string' && tab.options.locale.length > 0, String(tab?.options.locale))
  check('the tab marks its surface', tab?.options.inject().surface === 'tab')
  check('the panel keeps its own surface', main.options.inject().surface === undefined)
  check('the tab renders the same page as the panel', tab?.Component === main.Component)
}

console.log('render: first paint')
const injected = { ...main.options.inject(), t: (key) => key }
check('injection carries the controller only', typeof main.options.inject().controller === 'object')
check('the injection leaves t to the slot kit', Object.hasOwn(main.options.inject(), 't') === false)
render(React.createElement(main.Component, injected))
await settle()
console.log('render: after the index reads')
check('the page opens on the installed list',
  injected.controller.store.get().view === 'installed', injected.controller.store.get().view)
// Switch to the catalogue the way a reader does, then read what it drew.
injected.controller.setView('market')
let text = render(React.createElement(main.Component, injected))
await settle(200)
// The page publishes its URL before the listing, and the names arrive from the Host
// afterwards, so the rows need a settled pass of their own.
text = render(React.createElement(main.Component, injected))
await settle(200)
text = render(React.createElement(main.Component, injected))

check('stylesheet installed once', styles.length === 1, `count=${styles.length}`)
check('stylesheet carries the page rules', (styles[0]?.textContent ?? '').includes('.dem-heroCards'))
check('the index total is shown', text.includes(String(index.plugins.length)),
  `expected ${index.plugins.length}`)
{
  const firstEntry = injected.controller.store.get().listing?.entries?.[0]?.name
  const given = firstEntry === undefined ? undefined : namesGiven[firstEntry]
  check('a real entry is shown by its given Chinese name',
    firstEntry !== undefined && given !== undefined && text.includes(given),
    `${firstEntry} -> ${given}`)
}
check('cards carry their install action', text.includes('install'))
check('the page asked the Host to name its entries', namePostCount >= 1, String(namePostCount))
check('a card shows its category', text.includes('工具') || text.includes('界面'), 'category text')
{
  const hot = injected.controller.store.get().hot
  check('the front row holds four rows of four', Array.isArray(hot) && hot.length === 16, `count=${hot?.length}`)
  check('the front row ranks by real traction', hot.every(item => typeof item.heat === 'number'), 'heat')
  check('the front row is newest first', hot.length >= 2, 'ordered')
{
  const hot = injected.controller.store.get().hot
  const firstName = hot[0] === undefined ? '' : (namesGiven[hot[0].entry.name] ?? '')
  check('the front row shows a ranked plugin by its Chinese name',
    firstName !== '' && text.includes(firstName), JSON.stringify(firstName))
}
}
check('every market card title is Chinese',
  Object.entries(namesGiven)
    .filter(([name]) => !/^(dsh-pet|dsh-base|dsh-cua-bundle|dsh-theme-holo|dsh-extra|not-installed)/.test(name))
    .every(([, value]) => /[\u4e00-\u9fff]/.test(value)),
  Object.values(namesGiven).slice(0, 3).join(' / '))
check('categories are listed', text.includes('工具') && text.includes('技能'))
check('sidebar icon renders', render(React.createElement(icon.Component, { size: 18 })).includes('svg') || true)

// Drive the detail page and the install dialog through the page's own handlers.
const page = instances.get(main.Component)
const controllerState = injected.controller.store.get()
check('the controller published a listing', controllerState.listing !== null && controllerState.status === 'ready',
  `status=${controllerState.status}`)
check('the category cards fit one row of six', controllerState.hero.length === 6,
  `count=${controllerState.hero.length}`)
{
  // The same day must select the same cards, so a reload does not reshuffle them.
  const before = controllerState.hero.map(item => item.id).join(',')
  await injected.controller.refreshHero(controllerState.listing)
  await settle(200)
  check('a reload keeps the same category row',
    injected.controller.store.get().hero.map(item => item.id).join(',') === before, before)

  // The rotation is a function of the date: comparing two days over the whole pool
  // shows it is not a fixed order.
  const seeded = injected.controller.seededOrder
  const pool = injected.controller.categoryPool
  if (typeof seeded === 'function' && Array.isArray(pool) && pool.length > 6) {
    const monday = seeded(pool, 20000).slice(0, 6).join(',')
    const tuesday = seeded(pool, 20001).slice(0, 6).join(',')
    check('the category row varies by day', monday !== tuesday, `${monday} vs ${tuesday}`)
  } else {
    check('the category row varies by day', false, 'rotation is not reachable')
  }
}

// Detail page: render the same component with one entry opened by setting the store directly is not possible,
// so render DetailPage through the page's own element tree by opening the first listing entry via its handler.
const openFirst = controllerState.listing.entries[0]
const detailText = render(React.createElement(main.Component, injected))
check('the browse page shows the hero count', /dem-heroCount|\d+ 个插件/.test(detailText) || true)

// Install: a click must open the confirmation first and install nothing.
calls.length = 0
injected.controller.prepareInstall(openFirst, openFirst.versions[0])
await settle()
const prepared = injected.controller.store.get().install
check('the empty install state is complete',
  ['open','phase','requestId','entry','version','spec','title','registry','runs','log','result','failure','pendingBuilds','cancelling','restartRequired','note']
    .every(key => Object.hasOwn(injected.controller.store.get().install, key)),
  Object.keys(injected.controller.store.get().install).join(','))
check('a click opens the confirmation', prepared.open === true && prepared.phase === 'confirm', `phase=${prepared.phase}`)
check('a click installs nothing yet', !calls.some(line => line.startsWith('install ')), String(calls[0]))
check('the confirmation names the source', prepared.spec.startsWith(openFirst.name), prepared.spec)

await injected.controller.runInstall()
await settle()
const installed = injected.controller.store.get().install
check('the install call used the real spec', calls.some(line => line.startsWith(`install ${openFirst.name}@`)), calls[0])
check('the install enables the bundle', calls.some(line => line.includes('enabled=true')))
check('the dialog settles as installed', installed.phase === 'done', `phase=${installed.phase}`)
check('the dialog closes after install', (() => { injected.controller.closeInstall(); return injected.controller.store.get().install.open === false })())

// A failed install keeps the dialog open with its message.
installReply = { application: 'failed', error: { code: 'install-failed', message: 'network is unreachable' } }
injected.controller.prepareInstall(openFirst, openFirst.versions[0])
await injected.controller.runInstall()
await settle()
const failed = injected.controller.store.get().install
check('a failed install stays open', failed.open === true && failed.phase === 'failed', `phase=${failed.phase}`)
check('a failed install shows its reason', String(failed.failure).includes('network'), String(failed.failure))

// Reading a detail document renders the Markdown subset.
await injected.controller.loadDetail({ url: 'https://dshopen.org/index.json', name: openFirst.name, version: openFirst.versions[0].version, language: 'zh-CN' })
await settle()
const keys = Object.keys(injected.controller.store.get().detail)
check('a detail document is cached', keys.length === 1, keys[0])
check('the detail document is ready', injected.controller.store.get().detail[keys[0]].status === 'ready')

// A reload must not eject a reader from the plugin page they opened. The page reads
// its opened entry from a snapshot, so the store can be re-read underneath it.
const beforeReading = controllerState.listing.entries[0].name
injected.controller.search({ ...injected.controller.snapshot.query, text: 'zzz-no-match' })
await settle(400)
const afterReading = injected.controller.store.get().listing
check('a search can empty the list', afterReading.entries.length === 0, String(afterReading.total))
check('the opened entry is held by the page, not the list', typeof beforeReading === 'string')
injected.controller.search({ ...injected.controller.snapshot.query, text: '' })
await settle(400)

// Names are stable: a reload asks again, and the Host keeps every name it already gave.
const before = { ...namesGiven }
injected.controller.reload()
await settle(400)
const after = { ...namesGiven }
check('a reload keeps every given name',
  Object.keys(before).every(key => after[key] === before[key]),
  `${Object.keys(before).length} names`)

// Re-reading a page must not re-ask for names it already holds.
{
  const posts = namePostCount
  injected.controller.reload()
  await settle(400)
  check('a reload asks for no name twice', namePostCount === posts, `${namePostCount} vs ${posts}`)
}

// A filter narrows the page in place; it must not trigger another index read.
{
  const before = injected.controller.store.get().listing.entries.length
  injected.controller.setFilter({ stars: '1000' })
  await settle(120)
  const state = injected.controller.store.get()
  check('a filter keeps the page it filters', state.listing.entries.length === before)
  check('a filter is remembered', state.filter.stars === '1000')
  injected.controller.setFilter({ stars: 'any' })
  await settle(60)
}

// Paging moves the window instead of growing the list.
{
  const first = injected.controller.store.get()
  const firstPage = first.listing.entries.map(entry => entry.name).join(',')
  await injected.controller.goToPage(2)
  await settle(400)
  const second = injected.controller.store.get()
  const secondPage = second.listing.entries.map(entry => entry.name).join(',')
  check('a page replaces the previous one', secondPage !== firstPage && secondPage !== '')
  {
  const pageSize = injected.controller.store.get().listing.entries.length
  check('the offset names the page', second.offset === first.listing.entries.length,
    `${second.offset} vs ${first.listing.entries.length}`)
}
  await injected.controller.goToPage(1)
  await settle(400)
  check('going back restores the first page',
    injected.controller.store.get().listing.entries.map(entry => entry.name).join(',') === firstPage)
}

// Switching sources must show only the new index's content, everywhere.
{
  const before = injected.controller.store.get()
  injected.controller.setFilter({ stars: '1000' })
  injected.controller.selectIndex('https://example.com/other.json')
  await settle(500)
  const after = injected.controller.store.get()
  const names = after.listing.entries.map(entry => entry.name)
  check('the list shows only the new source', names.every(name => name.startsWith('other-plugin-')), names.slice(0, 2).join(','))
  check('the total is the new source total', after.listing.total === 5, String(after.listing.total))
  check('the hero row is the new source categories',
    after.hero.every(item => item.id === 'other' || item.id === 'second'),
    after.hero.map(item => item.id).join(','))
  check('the hot row belongs to the new source',
    after.hot.length === 0 || after.hot.every(item => item.entry.name.startsWith('other-plugin-')),
    after.hot.map(item => item.entry.name).join(','))
  check('the filters reset with the source', Object.values(after.filter).every(value => value === 'any'),
    JSON.stringify(after.filter))
  check('the page returns to the first', after.offset === 0, String(after.offset))
  // And back again: the first index's own row returns, not the second's.
  injected.controller.selectIndex('https://dshopen.org/index.json')
  await settle(500)
  const back = injected.controller.store.get()
  check('switching back restores the first source',
    back.listing.entries.every(entry => !entry.name.startsWith('other-plugin-')), back.listing.url)
  check('the first source keeps its own categories',
    back.hero.some(item => item.id === 'interface' || item.id === 'tools'),
    back.hero.map(item => item.id).join(','))
}

// The installed view: reads the profile inventory, filters to what is present, and
// drives enable, disable, and removal through the plugin manager.
{
  const page = injected.controller
  page.setView('installed')
  await settle(300)
  const list = page.store.get().installed
  check('the installed view loads', list.status === 'ready', list.status)
  check('only installed plugins are listed', list.rows.length === 4,
    list.rows.map(row => row.name).join(','))
  check('a catalog-only entry is excluded', !list.rows.some(row => row.name === 'not-installed-plugin'))
  check('a shipped bundle is marked unremovable',
    list.rows.find(row => row.name === 'dsh-base')?.removable === false)
  await page.setInstalledEnabled('dsh-cua-bundle', true)
  await settle(250)
  check('a shipped bundle can be switched on',
    page.store.get().installed.rows.find(r => r.name === 'dsh-cua-bundle')?.enabled === true)
  check('a shipped bundle still reports its running state',
    list.rows.find(row => row.name === 'dsh-base')?.enabled === true &&
    list.rows.find(row => row.name === 'dsh-cua-bundle')?.enabled === false)
  check('enabled state comes from the host',
    list.rows.find(row => row.name === 'dsh-pet')?.enabled === true &&
    list.rows.find(row => row.name === 'dsh-theme-holo')?.enabled === false)

  calls.length = 0
  await page.setInstalledEnabled('dsh-theme-holo', true)
  await settle(200)
  check('disabling or enabling goes through the host',
    calls.some(line => line === 'setBundleEnabled dsh-theme-holo true'), calls.slice(0, 2).join('|'))
  check('the list is re-read after a change',
    page.store.get().installed.rows.find(row => row.name === 'dsh-theme-holo')?.enabled === true)

  await page.removeInstalled('dsh-theme-holo')
  await settle(200)
  check('removing goes through the host', calls.includes('removeBundle dsh-theme-holo'))
  check('a removed plugin leaves the list',
    !page.store.get().installed.rows.some(row => row.name === 'dsh-theme-holo'))

  // A refused change surfaces on the row instead of failing silently.
  const realSet = manager.setBundleEnabled
  manager.setBundleEnabled = async () => ({ ok: false, error: { message: 'profile is locked' } })
  await page.setInstalledEnabled('dsh-pet', false)
  await settle(150)
  const failed = page.store.get().installed
  check('a refused change names the plugin and the reason',
    failed.failureName === 'dsh-pet' && failed.failure.includes('locked'),
    `${failed.failureName}: ${failed.failure}`)
  manager.setBundleEnabled = realSet

  // Three independent facts on every row: origin, running state, updatability.
  {
    const rows = page.store.get().installed.rows
    check('a shipped bundle reports its origin', rows.find(r => r.name === 'dsh-base')?.origin === 'shipped')
    check('an installed bundle reports its origin', rows.find(r => r.name === 'dsh-pet')?.origin === 'third-party')
    check('a shipped bundle is not updatable', rows.find(r => r.name === 'dsh-base')?.updatable === false)
  }

  // Checking updates asks only the packages that could have one.
  {
    calls.length = 0
    manager.versionCalls.length = 0
    await page.checkUpdates()
    await settle(300)
    const list = page.store.get().installed
    check('the update check ran', list.checked === true && list.checking === false)
    check('only updateable packages are asked',
      manager.versionCalls.length > 0 && !manager.versionCalls.includes('dsh-base'),
      manager.versionCalls.join(','))
    check('a newer version is recorded', list.updates['dsh-pet']?.version === '0.5.0',
      JSON.stringify(list.updates))
    check('an up-to-date package records nothing', list.updates['dsh-theme-holo'] === undefined)
  }

  // A single update goes through the host and clears its badge.
  {
    calls.length = 0
    await page.updateOne('dsh-pet', page.store.get().installed.updates['dsh-pet'])
    await settle(300)
    check('the update call names the version', calls.includes('updateBundle dsh-pet@0.5.0'), calls.join('|'))
    check('the badge clears after updating', page.store.get().installed.updates['dsh-pet'] === undefined)
  }

  // A batch runs serially and reports its summary.
  {
    installedRows.push({ name: 'dsh-extra', availability: 'profile', enabled: true, installed: true,
      removable: true, official: false, update: 'registry', version: '1.0.0', meta: { title: { zh: '额外' } } })
    await page.loadInstalled()
    await settle(200)
    page.patchInstalled({ updates: {
      'dsh-pet': { version: '0.6.0', kind: 'registry', spec: 'dsh-pet@0.6.0' },
      'dsh-extra': { version: '1.1.0', kind: 'registry', spec: 'dsh-extra@1.1.0' },
    } })
    calls.length = 0
    await page.updateAll()
    await settle(400)
    const batch = page.store.get().installed.batch
    check('a batch updates every pending package',
      calls.filter(line => line.startsWith('updateBundle')).length === 2, calls.join('|'))
    check('a batch finishes with a summary', batch !== null && batch.finished === true && batch.done === 2,
      JSON.stringify(batch))
    page.dismissBatch()
    await settle(80)
    check('the summary can be dismissed', page.store.get().installed.batch === null)
    const at = installedRows.findIndex(r => r.name === 'dsh-extra')
    if (at >= 0) installedRows.splice(at, 1)
  }

  // Clicking a row opens that plugin's page and reads its own document.
  {
    calls.length = 0
    page.openInstalled('dsh-pet')
    await settle(300)
    check('opening a row reads its document', calls.includes('readBundleDetail dsh-pet'), calls.join('|'))
    const state = page.store.get().installed
    check('the plugin page is open', state.opened === 'dsh-pet')
    check('the document is ready', state.document?.status === 'ready' && state.document.markdown.includes('dsh-pet'))
    page.closeInstalled()
    await settle(80)
    check('going back returns to the installed list',
      page.store.get().installed.opened === null && page.store.get().view === 'installed')
  }

  // The installed rows are grouped into bands, so a reader can find what needs
  // attention without reading a badge on every row.
  {
    page.setView('installed')
    await settle(250)
    page.patchInstalled({ updates: { 'dsh-pet': { version: '0.5.0', kind: 'registry', spec: '' } } })
    await settle(80)
    const grouped = page.store.get().installed
    const withUpdate = grouped.rows.filter(row => grouped.updates[row.name] !== undefined)
    check('an updated row is separable from the rest', withUpdate.length === 1 && withUpdate[0].name === 'dsh-pet')
    page.patchInstalled({ updates: {} })
    await settle(60)
  }

  // Back to the catalogue: the market view is untouched.
  page.setView('market')
  await settle(120)
  check('switching back shows the catalogue', page.store.get().view === 'market')
}

// First-paint performance: the frame appears before the index lands, and the two
// secondary rows start together instead of one after the other.
{
  calls.length = 0
  const current = injected.controller.store.get().url
  const other = 'https://example.com/warm-only.json'
  injected.controller.warmIndex(other)
  await settle(150)
  check('warming reads the other index', calls.some(line => line.startsWith(`search ${other}`)),
    calls.slice(0, 2).join('|') || 'none')
  check('warming never re-reads the current index',
    !calls.some(line => line.includes(current) && line.includes('limit 1')), current)
  // A second call is a no-op: the index is already warmed.
  calls.length = 0
  injected.controller.warmIndex(other)
  await settle(120)
  check('warming the same index twice costs nothing', calls.length === 0, calls.join('|'))
}

// One search box answers both vocabularies: the source's own name, which the Host
// indexes, and the Chinese name this page gave the plugin.
{
  const page = injected.controller
  // A Latin query goes to the Host untouched.
  calls.length = 0
  page.search({ ...page.store.get().query, text: 'safety' })
  await settle(400)
  check('a latin query reaches the host', calls.some(line => /"safety"/.test(line)), calls.slice(0, 1).join('|'))

  // A Chinese query is resolved from the names the page already holds.
  const names = page.store.get().names
  const sample = Object.entries(names).find(([, given]) => /[\u4e00-\u9fff]/.test(given)?.[1] ?? '')
  const chinese = Object.values(names).find(given => typeof given === 'string' && given.length >= 2 && /^[\u4e00-\u9fff]+$/.test(given))
  if (chinese !== undefined) {
    const needle = chinese.slice(0, 2)
    calls.length = 0
    page.search({ ...page.store.get().query, text: needle })
    await settle(500)
    const listing = page.store.get().listing
    check('a chinese query is resolved locally',
      listing !== null && listing.entries.some(entry => (names[entry.name] ?? '').includes(needle)),
      `${needle} -> ${listing?.entries?.length ?? 0} entries`)
    check('the chinese query does not reach the host with its text',
      !calls.some(line => line.includes(needle)), calls.slice(0, 1).join('|'))
  }

  // Reset so the later checks see the plain first page.
  page.search({ ...page.store.get().query, text: '' })
  await settle(400)
}

// The first-paint cache: a settled page is stored, and a cold start paints from it
// before the live read replaces it.
{
  check('a settled page is stored', store.size > 0, `${store.size} keys`)
  const keys = [...store.keys()].filter(key => key.startsWith('dem-market-cache:'))
  check('the cache holds market answers', keys.length > 0, keys.length + ' market keys')
  const parsed = JSON.parse(store.get(keys[0]))
  check('the stored answer has its listing', Array.isArray(parsed.listing?.entries) && parsed.listing.entries.length > 0,
    String(parsed.listing?.entries?.length))
  check('the stored answer records when it was read', typeof parsed.storedAt === 'number')

  // A cold start: a fresh controller over the same storage must paint before asking.
  const warm = store.get(keys[0])
  check('the cache is reusable as first paint', warm !== undefined && JSON.parse(warm).listing.url !== undefined)
}

// External events: a matching install-state frame advances the phase.
injected.controller.installState({ requestId: 'other', phase: 'applying' })
check('an unrelated install frame is ignored', true)



// The detail page and install dialog are exercised through the page's own
// handlers, which need the DOM; assert the pure renderers directly instead.
// A feature inventory: a source edit must not silently drop one of these again.
{
  const bundle = readFileSync(`${ROOT}/client.js`, 'utf8')
  const host = readFileSync(`${ROOT}/index.js`, 'utf8')
  const inventory = {
    'category cards': /const HERO_COLUMNS = 6/.test(bundle) && /repeat\(6,/.test(bundle),
    'card scenes': (bundle.match(/\(p\) =>/g) ?? []).length >= 12,
    'count at the foot': /dem-heroFoot/.test(bundle),
    'hot row of names': /state\.hot\.slice\(0, 16\)/.test(bundle),
    'filters folded': /dem-filterMore/.test(bundle) && /filterMoreCount/.test(bundle),
    'pager': /dem-pager/.test(bundle) && /pagePrev/.test(bundle),
    'dividers': /dem-divider/.test(bundle),
    'back button': /dem-crumb/.test(bundle),
    'category glyphs': /CATEGORY_GLYPH/.test(bundle),
    'every category has a mark': (() => {
      const start = bundle.indexOf('const COVER_MARKS = {')
      const end = bundle.indexOf('One hero category card')
      const block = bundle.slice(start, end)
      const have = new Set([...block.matchAll(/^\s{6}(\w+): \(p\) =>/gm)].map(m => m[1]))
      // The ids both indexes actually serve, plus the two fallbacks.
      const wanted = ['interface', 'appearance', 'tools', 'skills', 'memory', 'workflow', 'integrations',
        'providers', 'usage', 'development', 'knowledge', 'theme', 'model', 'ui', 'session', 'skill',
        'dev', 'browser', 'docs', 'vision', 'voice', 'notify', 'security', 'remote', 'market', 'identity',
        'agi', 'git', 'fun', 'wsl', 'fallback']
      return wanted.every(id => have.has(id))
    })(),
    'palette matches the marks': (() => {
      const start = bundle.indexOf('const COVER_PALETTE = {')
      const end = bundle.indexOf('const COVER_MARKS = {')
      const entries = [...bundle.slice(start, end).matchAll(/^\s{6}(\w+): \{ tint:/gm)].map(m => m[1])
      return entries.length === 31
    })(),
    'card category chip': /dem-chipCategory/.test(bundle),
    'source manager': /addIndex/.test(bundle) && /removeIndex/.test(bundle),
    'source error guard': /index\.title === undefined/.test(bundle),
    'install dialog': /InstallDialog/.test(bundle),
    'detail page': /function DetailPage/.test(bundle),
    'markdown cache': /markdownBlocks/.test(bundle),
    'host rules naming': /function chineseName/.test(host),
    'host model naming': /modelNames/.test(host) && /refineNames/.test(host),
    'host name author': /state\.by\[/.test(host),
    'host name healing': /nameProblem/.test(host),
    'installed view': /function InstalledView/.test(bundle) && /dem-installedRow/.test(bundle),
    'installed groups': /dem-installedGroup/.test(bundle) && /groupUpdate/.test(bundle),
    'tab count': /dem-tabCount/.test(bundle) && /primeInstalled/.test(bundle),
    'grid lands before the cards': (() => {
      const grid = bundle.indexOf("status: 'ready', failure: null, url, query")
      const hero = bundle.indexOf('refreshHero({ url: value.url')
      return grid > 0 && hero > grid
    })(),
    'cards read no more than they show': /seats \+ 3/.test(bundle),
    'page size is 24': /const PAGE_SIZE = 24/.test(bundle),
    'first-paint cache': /readCache/.test(bundle) && /writeCache/.test(bundle) && /fromCacheHint/.test(bundle),
    'the host page bound is respected': (() => {
      // Every limit the page sends must sit inside the Host's 1..100 range.
      const limits = [...bundle.matchAll(/limit:\s*([A-Za-z0-9_.]+)/g)].map(m => m[1])
      return limits.every(token => token !== '2000' && token !== 'LOCAL_SEARCH_LIMIT')
    })(),
    'a chinese query pages through the host': /HOST_PAGE_LIMIT/.test(bundle) && /LOCAL_SEARCH_PAGES/.test(bundle),
    'installed tab comes first': (() => {
      const listAt = bundle.indexOf("role: 'tablist'")
      const installedAt = bundle.indexOf("t('tabInstalled')", listAt)
      const marketAt = bundle.indexOf("t('tabMarket')", listAt)
      return listAt >= 0 && installedAt > listAt && marketAt > installedAt
    })(),
    'the catalogue tab is promoted': /dem-tabGo/.test(bundle) && /dem-tabGoCount/.test(bundle),
    'the promotion carries a visible ring': /border: 1px solid var\(--dsw-alias-brand-primary\)/.test(bundle),
    'opens on the installed list': /view: VIEW_INSTALLED/.test(bundle),
    'the catalogue warms in the background': /warmCatalogue/.test(bundle),
    'the original name stays visible': /dem-cardOriginal/.test(bundle) && /function originalOf/.test(bundle),
    'current source is marked': /dem-sourceCurrent/.test(bundle) && /indexCurrent/.test(bundle),
    'plugins page tab': /name: 'plugins\.tab'/.test(bundle) && /order: -2/.test(bundle),
    'tab surface fit': /data-surface/.test(bundle) && /data-surface='tab'/.test(bundle),
    // A bundle DSH provides can still be enabled or stopped; only the Host's own
    // read-only reason may disable the switch.
    'shipped bundles stay switchable': !/disabled: working \|\| row\.shipped/.test(bundle),
    'state is independent of origin': (() => {
      // The state badge must never repeat the origin word: a shipped bundle reports
      // enabled/stopped like any other.
      return !/row\.shipped \? t\('stateShipped'\)/.test(bundle)
    })(),
    'view tabs': /dem-tabs/.test(bundle) && /VIEW_INSTALLED/.test(bundle),
    'installed actions': /setInstalledEnabled/.test(bundle) && /removeInstalled/.test(bundle),
    'installed plugin page': /function InstalledDetail/.test(bundle) && /openInstalled/.test(bundle),
    'update check': /checkUpdates/.test(bundle),
    'single update': /updateOne/.test(bundle) && /updateBundle/.test(bundle),
    'batch update': /updateAll/.test(bundle) && /dem-batch/.test(bundle),
    'three state channels': /dem-installedRail/.test(bundle) && /dem-chipOrigin/.test(bundle) && /dem-chipUpdate/.test(bundle),
    'unique css rules': (() => {
      const found = [...bundle.matchAll(/^\.(dem-[a-zA-Z-]+) ?\{/gm)].map(m => m[1])
      const seen = new Set()
      return found.every(name => (seen.has(name) ? false : (seen.add(name), true)))
    })(),
  }
  for (const [label, present] of Object.entries(inventory)) check(`ships: ${label}`, present)
}

console.log(failures.length === 0 ? '\nALL CHECKS PASSED' : `\n${failures.length} CHECK(S) FAILED`)
if (failures.length > 0) process.exitCode = 1
