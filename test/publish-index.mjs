// Validate the index with the same zod schema the Host parses with.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
const { z } = await import('/Applications/DSH Desktop.app/Contents/Resources/dsh-runtime/node_modules/zod/index.js')
const fs = await import('node:fs/promises')
const INDEX_PATH = join(here, '..', 'dist', 'index.json')

const localized = z.union([z.string(), z.intersection(z.object({ en: z.string() }), z.record(z.string(), z.string()))])
const declaration = z.object({ title: localized })
const source = z.union([
  z.object({ type: z.literal('npm'), registry: z.string().optional() }),
  z.object({ type: z.literal('git'), url: z.string(), commit: z.string(), path: z.string().optional() }),
])
const version = z.object({
  version: z.string(),
  publishTimestamp: z.number(),
  source,
  engines: z.object({ dsh: z.string().optional() }),
})
const plugin = z.object({
  name: z.string(),
  title: localized.optional(),
  description: localized.optional(),
  icon: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().optional(),
  repository: z.object({ url: z.string(), directory: z.string().optional() }).optional(),
  metadata: z.object({
    category: z.string().optional(),
    keywords: z.array(z.string()),
    labels: z.array(z.string()),
    sortKeys: z.record(z.string(), z.number()),
  }),
  versions: z.array(version),
})
const index = z.object({
  metadata: z.object({
    categories: z.record(z.string(), declaration),
    labels: z.record(z.string(), declaration),
    sortKeys: z.record(z.string(), z.object({ title: localized, order: z.union([z.literal('asc'), z.literal('desc')]) })),
  }),
  plugins: z.array(plugin),
})

const raw = await fs.readFile(INDEX_PATH, 'utf8')
const parsed = index.safeParse(JSON.parse(raw))
if (parsed.success) {
  const p = parsed.data.plugins[0]
  console.log('✓ 索引通过宿主 schema 校验')
  console.log('  插件:', p.name, '| 版本数:', p.versions.length)
  console.log('  来源:', p.versions.map(v => v.source.type).join(', '))
  console.log('  分类:', Object.keys(parsed.data.metadata.categories).join(', '))
  // Every referenced category and label must exist in the declarations.
  const cats = new Set(Object.keys(parsed.data.metadata.categories))
  const labels = new Set(Object.keys(parsed.data.metadata.labels))
  const badCat = p.metadata.category !== undefined && !cats.has(p.metadata.category)
  const badLabel = p.metadata.labels.filter(l => !labels.has(l))
  const badSort = Object.keys(p.metadata.sortKeys).filter(k => !(k in parsed.data.metadata.sortKeys))
  console.log('  引用未声明分类:', badCat ? p.metadata.category : '无')
  console.log('  引用未声明标签:', badLabel.length ? badLabel.join(',') : '无')
  console.log('  引用未声明排序键:', badSort.length ? badSort.join(',') : '无')
  // The listing blurb carries a promise a reader can check, so the two facts behind it
  // must stay in the text: the daily rotation and the permanent name.
  const zh = p.description?.zh ?? ''
  const promises = [
    ['点名了全中文与 DSH', zh.includes('全中文') && zh.includes('DSH')],
    ['写明了每日轮换', /每日轮换|每天换/.test(zh)],
    ['写明了名字不再变', /起过就不变|起过就不变|永久不变/.test(zh)],
  ]
  for (const [label, ok] of promises) console.log((ok ? '  ✓ ' : '  ✗ ') + label)
  if (promises.some(([, ok]) => !ok)) process.exitCode = 1

} else {
  console.error('✗ 校验失败:')
  for (const issue of parsed.error.issues) console.error('  -', issue.path.join('.'), issue.message)
  process.exitCode = 1
}
