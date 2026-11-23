/**
 * Expert market bundle, Host half.
 *
 * The page names every plugin in Chinese, and a name must never change once it
 * has been given: it is bound to the plugin's own package name and stored on
 * this machine, so rebuilding an index, refreshing the page, or publishing a new
 * version keeps the same Chinese name forever. Only a plugin that disappears from
 * the index stops being consulted; its record stays for a future return.
 *
 * The browser half asks for names through this route, so the naming and its
 * persistence live on the Host rather than in the page:
 *
 * - `GET  /expert-market/names` — every name given so far.
 * - `POST /expert-market/names` — the entries the page is about to show; answers
 *   the complete name map, computing only names that were never given.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/** Route prefix of the naming endpoint. */
const ROUTE = '/expert-market/names'
/** Stored map version; bump only for an incompatible on-disk shape. */
const STORE_VERSION = 1
/** Largest request body accepted, in bytes. */
const MAX_BODY_BYTES = 512 * 1024
/** Shortest and longest Chinese name the page accepts. */
const NAME_MIN = 2
const NAME_MAX = 12

const CJK = /[\u4e00-\u9fff]/

// ---------------------------------------------------------------- word maps

/**
 * English title words and the Chinese term each names. A word with no entry is
 * not translated; the naming rules fall through to the description instead of
 * inventing a term.
 */
const WORDS = {
  memory: '记忆', mem: '记忆', recall: '回忆', eternal: '永恒', remember: '记忆',
  session: '会话', sessions: '会话', conversation: '对话', chat: '聊天', message: '消息', messages: '消息',
  model: '模型', models: '模型', llm: '大模型', provider: '供应商', providers: '供应商', router: '路由', gateway: '网关',
  theme: '主题', themes: '主题', skin: '皮肤', skins: '皮肤', wallpaper: '壁纸', style: '样式', appearance: '外观',
  color: '配色', colors: '配色', palette: '配色', font: '字体', layout: '布局', icon: '图标', icons: '图标',
  sidebar: '侧栏', panel: '面板', dock: '停靠栏', bar: '栏', nav: '导航', tab: '标签页', tabs: '标签页', menu: '菜单',
  composer: '输入框', input: '输入', editor: '编辑器', workspace: '工作区', project: '项目', projects: '项目',
  file: '文件', files: '文件', folder: '目录', doc: '文档', docs: '文档', document: '文档', documents: '文档',
  markdown: 'Markdown', image: '图片', images: '图片', vision: '视觉', video: '视频', audio: '音频', voice: '语音',
  sound: '声音', music: '音乐', media: '媒体', canvas: '画布', graph: '图表', chart: '图表', tree: '树',
  viewer: '查看器', preview: '预览', reader: '阅读器', board: '看板', card: '卡片', cards: '卡片', badge: '徽章',
  search: '搜索', find: '查找', fetch: '抓取', crawl: '爬取', scrape: '抓取', browser: '浏览器', web: '网页',
  proxy: '代理', tunnel: '隧道', remote: '远程', mobile: '手机端', desktop: '桌面', native: '原生',
  git: 'Git', github: 'GitHub', gitlab: 'GitLab', review: '评审', diff: '差异', commit: '提交',
  mcp: 'MCP', api: 'API', skill: '技能', skills: '技能', tool: '工具', tools: '工具', kit: '工具包',
  plugin: '插件', plugins: '插件', extension: '扩展', addon: '扩展', module: '模块', widget: '小部件',
  agent: '代理', agents: '代理', subagent: '子代理', team: '团队', swarm: '集群', workflow: '工作流',
  task: '任务', tasks: '任务', todo: '待办', plan: '计划', schedule: '定时', cron: '定时',
  prompt: '提示词', context: '上下文', compact: '压缩', compaction: '压缩', token: 'Token', tokens: 'Token',
  usage: '用量', cost: '费用', billing: '计费', balance: '余额', quota: '配额', credit: '额度', credits: '额度',
  ledger: '账本', stats: '统计', status: '状态', monitor: '监控', meter: '计量', expense: '开销',
  notify: '通知', notification: '通知', notifications: '通知', alert: '提醒', remind: '提醒',
  approval: '审批', permission: '权限', guard: '守卫', safe: '安全', safety: '安全', security: '安全',
  check: '检查', audit: '审计', inspect: '检查', diagnostics: '诊断', doctor: '诊断', repair: '修复', fix: '修复',
  auth: '授权', oauth: '授权', login: '登录', account: '账户', key: '密钥', keys: '密钥', secret: '密钥',
  sync: '同步', backup: '备份', restore: '恢复', export: '导出', import: '导入', archive: '归档',
  update: '更新', upgrade: '升级', restart: '重启', reload: '重载', migrate: '迁移', version: '版本',
  cache: '缓存', queue: '队列', job: '作业', jobs: '作业', run: '运行', runner: '运行器',
  config: '配置', settings: '设置', option: '选项', options: '选项', preset: '预设', presets: '预设',
  mode: '模式', switch: '切换', switcher: '切换器', picker: '选择器', selector: '选择器', slider: '滑条',
  control: '控制台', console: '控制台', terminal: '终端', shell: '终端', tui: '终端界面', cli: '命令行',
  bridge: '桥接', connect: '连接', connector: '连接器', link: '链接', hub: '中心', center: '中心',
  studio: '工作室', workbench: '工作台', lab: '实验室', forge: '工坊',
  manager: '管理器', manage: '管理', management: '管理', admin: '管理', dashboard: '仪表盘',
  note: '笔记', notes: '笔记', journal: '日志', diary: '日志', log: '日志', history: '历史',
  knowledge: '知识', wiki: '知识库', index: '索引', catalog: '目录',
  translate: '翻译', translation: '翻译', i18n: '多语言', locale: '语言包', language: '语言包',
  persona: '人格', profile: '档案', soul: '灵魂', character: '角色', role: '角色',
  pet: '桌宠', whale: '鲸鱼', avatar: '分身',
  novel: '小说', story: '故事', writing: '写作', writer: '写作',
  data: '数据', database: '数据库', sql: 'SQL', sqlite: 'SQLite', json: 'JSON', csv: 'CSV',
  drive: '云盘', cloud: '云端', storage: '存储', asset: '素材', assets: '素材', resource: '资源',
  quick: '快捷', fast: '快速', smart: '智能', auto: '自动', better: '优化版', improved: '增强版',
  advanced: '高级版', simple: '简约', minimal: '极简', custom: '自定义', personal: '个性化',
  local: '本地', offline: '离线', online: '在线', live: '实时', realtime: '实时', instant: '即时',
  multi: '多', universal: '通用', general: '通用', core: '核心', base: '基础', basic: '基础',
  mini: '迷你', lite: '轻量版', pro: '专业版', plus: '增强版', max: '满配', premium: '高级版',
  daily: '每日', weekly: '每周', effort: '推理等级', thinking: '思考', reasoning: '推理',
  ask: '提问', question: '问答', answer: '回答', reply: '回复', feedback: '反馈',
  code: '代码', coding: '编程', programmer: '编程', dev: '开发', developer: '开发',
  debug: '调试', test: '测试', tests: '测试', format: '格式化', build: '构建',
  deploy: '部署', install: '安装', package: '包', dependency: '依赖',
  window: '窗口', screen: '屏幕', float: '悬浮', floating: '悬浮', overlay: '浮层',
  sticker: '贴纸', emoji: '表情', wave: '波形', pulse: '脉冲', damage: '伤害',
  game: '游戏', fun: '娱乐', joke: '趣味',
  qq: 'QQ', wechat: '微信', feishu: '飞书', dingtalk: '钉钉', telegram: 'Telegram',
  im: '即时通讯', bot: '机器人', bots: '机器人', webhook: 'Webhook', channel: '频道',
  bili: '哔哩哔哩', bilibili: '哔哩哔哩',
  crypto: '加密', wallet: '钱包', chain: '链',
  ops: '运维', diagnose: '诊断', harmonizer: '协调器', adapt: '适配', adapter: '适配器',
  inspector: '检查器', explorer: '浏览', navigator: '导航', launcher: '启动器',
  optimize: '优化', optimizer: '优化器', compress: '压缩', split: '拆分', merge: '合并',
  convert: '转换', converter: '转换器', encode: '编码', decode: '解码', encrypt: '加密',
  decrypt: '解密', mask: '脱敏', redact: '脱敏',
  thread: '线程', concurrency: '并发', limit: '限制', timeout: '超时', retry: '重试',
  loop: '循环', hook: '钩子', event: '事件', trigger: '触发器', action: '动作', command: '命令',
  button: '按钮', tag: '标签', tags: '标签', label: '标签', category: '分类',
  sort: '排序', filter: '筛选', group: '分组', page: '分页',
  mirror: '镜像', clone: '克隆', fork: '分叉', snapshot: '快照',
}

/** Title tokens that carry no subject on their own. */
const NOISE = new Set([
  'dsh', 'harness', 'deepseek', 'ds', 'x', 'the', 'a', 'an', 'of', 'and', 'for', 'to', 'in', 'on',
  'with', 'by', 'my', 'your', 'it', 'is', 'we', 'you', 'app', 'application', 'client', 'server',
  'node', 'js', 'ts', 'react', 'v1', 'v2', 'v3', 'beta', 'alpha', 'demo', 'sample',
])

/** Category id to the Chinese subject used when nothing else names the plugin. */
const CATEGORY = {
  interface: '界面', tools: '工具', skills: '技能', memory: '记忆', providers: '模型接入',
  usage: '用量', integrations: '集成', appearance: '外观', workflow: '工作流', development: '开发',
  knowledge: '知识', agi: '探索', theme: '主题', model: '模型', identity: '身份', session: '会话',
  wsl: '兼容', browser: '浏览器', vision: '视觉', voice: '语音', docs: '文档', skill: '技能',
  notify: '通知', dev: '开发', security: '安全', remote: '远程', market: '市场', fun: '娱乐',
  git: 'Git', ui: '界面', game: '游戏', data: '数据', media: '媒体',
}

/** Names that are too generic to stand alone; paired with the category instead. */
const GENERIC = new Set([
  '文档', '插件', '工具', '界面', '主题', '设置', '管理', '服务', '数据', '模型', '技能',
  '会话', '聊天', '网页', '文件', '扩展', '模块', '资源', '配置', '控制台', '工作区', '项目',
  '状态', '模式', '功能', '助手', '安全', '授权', '审批', '审计', '守卫', '记忆', '壁纸',
  '搜索', '抓取', '快捷', '输入框', '通知', '测试', '代理', '桌面', '云盘', '宠物', '用量',
  '外观', '工具', '开发', '运维', '集成', '知识', '研究', '娱乐', '远程', '通信', '身份',
])

/** Objects a description acts on, as a Chinese head phrase. */
const OBJECT_RULES = [
  // 对 X 的 Y 进行 … names Y, the thing the plugin touches.
  /对[\u4e00-\u9fff\s]{0,10}?的([\u4e00-\u9fff]{2,8}?)进行/,
  // … 的 Y 写入 / 脱敏 / 校验
  /的([\u4e00-\u9fff]{2,8}?)(?:进行|写入|保存|脱敏|校验|统计)/,
  // 对 X 中的 Y 进行 … / 把 X 写入 Y / 给 X 添加 Y
  /(?:对|把|将|给|为|向)([\u4e00-\u9fff]{2,8}?)(?:进行|做|写入|写进|保存|发送|添加|增加|设置|接入|接入到|导出|导入|转换|渲染|生成)/,
  // 以 X 为准 / 按 X 统计 / 基于 X 的 Y
  /(?:以|按|基于|通过|使用)([\u4e00-\u9fff]{2,8}?)(?:为准|统计|计算|判断|生成|渲染|读取)/,
  // 支持 X / 提供 X / 显示 X
  /(?:支持|提供|显示|管理|检查|记录|统计|监控|分析|处理|转换|导出|导入|同步|连接|接入|集成)([\u4e00-\u9fff]{2,8})/,
]

/**
 * Trim a matched object phrase to a name: drop a leading modifier such as 已…/该…,
 * a trailing particle, and any cut that cannot end a noun.
 * @param value the matched phrase.
 * @returns a 2–6 character phrase, or an empty string.
 */
function objectWord(value) {
  let word = String(value).trim()
    .replace(/^(?:已|该|本|此|其|各个?|所有|全部|这些|那些|新的?|旧的?)/, '')
    .replace(/[的了着过在和与及或]$/, '')
    // A phrase can open on the verb the sentence supplied ("支持秘密模式"); a name
    // keeps the noun that follows it.
    .replace(/^(?:支持|提供|显示|管理|检查|记录|统计|监控|分析|处理|转换|导出|导入|同步|连接|接入|集成|手动|自动|快速|一键)/, '')
    .trim()
  // "切换厂商" keeps a verb; a name is the noun it acted on.
  word = word.replace(/^(?:切换|调节|查看|选择|打开|关闭|保存|发送|生成|构建|统计|对比)/, '')
  if (word.length > 6) word = word.slice(0, 6)
  if (word.length < 2) return ''
  if (!CJK.test(word)) return ''
  if (CLAUSE_HEAD.test(word)) return ''
  if (CUT_TAIL.test(word)) return ''
  return word
}

/**
 * The object a description works on: a noun phrase that says what the plugin
 * touches, used only when nothing else names it.
 * @param description the entry's Chinese description.
 * @returns a 2–8 character phrase, or an empty string.
 */
function objectName(description) {
  const text = String(description)
    .replace(/^[★☆\s\d,.]+│?\s*/, '')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[A-Za-z][A-Za-z0-9._/+-]*/g, ' ')
    .replace(/\s+/g, ' ')
  for (const rule of OBJECT_RULES) {
    const match = rule.exec(text)
    if (match === null) continue
    // An object phrase is already the noun the sentence acts on, so it only needs
    // its leading modifier and trailing particle trimmed — the stricter head-word
    // test would reject a good phrase like "已支持秘密模式".
    const candidate = objectWord(match[1])
    if (candidate !== '' && !GENERIC.has(candidate) && !/^[的了着过已并和与及或]/.test(candidate)) return candidate
  }
  return ''
}

/** Chinese verbs and connectives that cannot begin a name. */
const LEADING = /^(?:在|于|把|被|让|将|向|为|对|从|由|与|和|及|或|并|且|再|还|也|都|就|才|即|可|能|会|要|需|须|应|当|如|若|因|由于|通过|支持|提供|显示|管理|检查|重算|实现|采用|使用|接入|集成|添加|增加|创建|构建|生成|打开|关闭|保存|记录|统计|监控|分析|处理|转换|导出|导入|同步|连接|发送|接收|转发|拦截|替换|修改|调整|优化|压缩|加密|解密|脱敏|读取|写入|执行|运行|启动|停止|安装|卸载|升级|更新|修复|诊断|测试|校验|验证|对比|比较|查找|搜索|检索|抓取|爬取|渲染|预览|播放|拖动|拖入|点击|选择|切换|分派|收集|审阅|整理|提炼|保留|留在|作为|成为|包含|包括|涵盖|覆盖|面向|针对|适用|专门|主要|只|仅|全部|所有|每个|各)/

// ---------------------------------------------------------------- naming

/** Read a localized index value in one language. */
function textOf(value, language) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return String(value)
  const base = language.split('-')[0]
  if (typeof value[language] === 'string' && value[language] !== '') return value[language]
  if (typeof value[base] === 'string' && value[base] !== '') return value[base]
  if (typeof value.en === 'string' && value.en !== '') return value.en
  for (const candidate of Object.values(value)) if (typeof candidate === 'string' && candidate !== '') return candidate
  return ''
}

/** Split a title into lower-case word tokens. */
function tokens(text) {
  return String(text)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .filter(Boolean)
}

/**
 * Whether a stored name reads as a rule name rather than a decided one.
 *
 * Rule names are recognisable: a bare category plus 插件, or a "X · Y" pair the
 * rules joined. A decided name is anything else, and stays forever.
 * @param value the stored name.
 * @returns true when the model may still replace it.
 */
function looksRuleGiven(value) {
  if (typeof value !== 'string') return false
  if (/^[\u4e00-\u9fff]{1,4}插件$/.test(value)) return true
  const pair = /^(.+?)\s*·\s*(.+)$/.exec(value)
  if (pair !== null) return true
  return value.length <= 3
}

/** Whether a head word says enough to name a plugin. */
function usable(word) {
  return typeof word === 'string' && word !== '' && !GENERIC.has(word)
}

/** Keep a plausible Chinese head word from one description clause, or nothing. */
function headWord(value) {
  let word = String(value)
    .replace(/^[★☆\s\d,.]+│?\s*/, '')
    .replace(LEADING, '')
    .replace(/[和与及或].*$/, '')
    .replace(/^(?:按|将|把|对|从|由|以|用|基于|通过|根据|针对|围绕|借助|依靠|每隔?)/, '')
    .trim()
  // "区分版本的技能" names the modifier, so the head is what follows 的.
  const modifier = /^[\u4e00-\u9fff]{2,6}的([\u4e00-\u9fff]{2,6})$/.exec(word)
  if (modifier !== null) word = modifier[1]
  word = word.split(/\s+/)[0]
  // A run that begins on a particle is the tail of a phrase, not a head word.
  const run = /[\u4e00-\u9fff]{2,}/.exec(word.replace(/^[的了着过已并将把被让在你我他她它]+/, ''))
  if (run === null) return ''
  word = run[0].replace(/[的了着过已并将把被让在]$/, '').trim()
  if (word.length < 2 || LEADING.test(word)) return ''
  // Trim a phrase cut mid-word, which reads as a dangling descriptor.
  // A fragment carrying a particle anywhere, or a mid-phrase cut, is not a name.
  if (/[的了着过已并在把被让将向从由与和及或]/.test(word)) return ''
  if (/^[的了着过已并]/.test(word)) return ''
  if (TRUNCATED.test(word)) return ''
  if (CUT_TAIL.test(word)) return ''
  if (CLAUSE_HEAD.test(word)) return ''
  // Longer than six characters is a clause, not a head word.
  if (word.length > 6) return ''
  return word
}

/**
 * Endings that mark a phrase cut mid-thought ("工作区的多个", "传入的检查命").
 * Such a fragment reads as broken Chinese, so it cannot name a plugin.
 */
const TRUNCATED = /(?:的|多个|每个|任意|已配|检查命|工作方|检查|过程自动|形式)$/

/** Openings that make a whole clause narrative, so it cannot name anything. */
const CLAUSE_OPEN = /^(?:当|如果|若|一旦|在|于|通过|使用|把|将|让|为|向|对|从|由|一个|一些|一种|一切|任何|所有|每个|若干|这套|那套|本次|该|其|此)/

/** Words that open a clause rather than name a thing ("一个可以", "提出小而"). */
const CLAUSE_HEAD = /^(?:一个|一些|一种|一类|一批|一切|任何|所有|每个|若干|这套|那套|本次|该|其|此|这样|那样|可以|能够|需要|必须|应该|建议|帮助|用于|用来|负责|专注|致力|打造|提出|找出|生成|产出)/

/**
 * Characters that cannot end a Chinese noun. A name ending on one of these is a
 * phrase cut mid-word ("配置遥", "请求头超", "提出小而"), which reads as broken.
 */
const CUT_TAIL = /(?:遥|超|小|多|大|长|短|高|低|快|慢|新|旧|早|晚|内|外|上|下|前|后|左|右|中|间|里|就|还|也|都|只|更|最|很|太|能|会|要|可|该|其|此|该)$/

/**
 * Derive a short functional Chinese name from a description.
 * @param description the entry's Chinese description, with its leading figures.
 * @returns a head word such as `输入框`, or an empty string.
 */
function functionName(description) {
  const text = String(description).replace(/^[★☆\s\d,.]+│?\s*/, '').trim()
  // A clause that opens as narrative ("当 Cookie…", "一个可以…") describes a
  // situation; the naming words come from later clauses.
  for (const clause of text.split(/[。；;！!？?]/).map(part => part.trim()).filter(Boolean)) {
    if (CLAUSE_OPEN.test(clause)) continue
    for (const part of clause.split(/[，,、：:]/).map(piece => piece.trim()).filter(Boolean)) {
      const located = /(?:在|于)([\u4e00-\u9fff]{2,6}?)(?:中|里|旁|内|上|下|外|之间)/.exec(part)
      if (located !== null && usable(headWord(located[1]))) return headWord(located[1])
      const target = /(?:为|给|向|对)([\u4e00-\u9fff]{2,6}?)(?:提供|添加|增加|设置|接入|显示|发送|生成|做|开|建|写|加)/.exec(part)
      if (target !== null && usable(headWord(target[1]))) return headWord(target[1])
      const bare = headWord(part)
      if (usable(bare)) return bare
      // The first clean Chinese run of the clause, when nothing grammatical survived.
      const run = /[\u4e00-\u9fff]{2,4}/.exec(part.replace(LEADING, ''))
      if (run !== null && usable(headWord(run[0]))) return headWord(run[0])
    }
  }
  return ''
}

/** Guarantee a short, Chinese, non-empty name. */
function finish(candidate, category, description) {
  let name = String(candidate)
    .replace(/\([^()]*\)|（[^（）]*）/g, '')
    .replace(/[—–\-·|/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // A leftover brand ("Beauticode 背景" → "Beauticode") names nothing in Chinese.
  if (!CJK.test(name)) {
    const remainder = name.replace(/[A-Za-z][A-Za-z0-9+.]*/g, '').trim()
    name = CJK.test(remainder) ? remainder : ''
  }
  if (!CJK.test(name)) name = functionName(description)
  if (!CJK.test(name)) name = objectName(description)
  if (!CJK.test(name)) {
    // Last resort: the category names the plugin, so a name is always Chinese.
    name = `${category}插件`
  }
  if (name.length > NAME_MAX) {
    const cut = name.slice(0, NAME_MAX)
    const space = cut.lastIndexOf(' ')
    name = (space >= 5 ? cut.slice(0, space) : cut).trim()
  }
  name = name.replace(/[的了着过已并和与及或]$/, '').trim()
  // A 1-character remnant, a particle-led fragment, or a mid-word cut names nothing.
  if (name.length < NAME_MIN || /^[的了着过已并]/.test(name) || CUT_TAIL.test(name) || TRUNCATED.test(name)) {
    name = `${category}插件`
  }
  // A bare category noun ("技能", "安全") reads as a filter, not a plugin, so it is
  // paired with the object its description acts on. That object is the only part
  // that says which plugin this is, so it leads: "秘密模式 · 安全".
  if (GENERIC.has(name)) {
    const object = objectName(description)
    if (object !== '' && object !== name && !GENERIC.has(object)) name = `${object} · ${name}`
    else name = name.includes(category) || category.includes(name) ? `${name}插件` : `${category} · ${name}`
  }
  return name
}

/**
 * A Chinese display name for one market entry.
 * @param entry the entry's package name, title, description, and category.
 * @returns a 2–12 character Chinese name.
 */
function chineseName(entry) {
  const titleZh = textOf(entry.title, 'zh')
  const titleEn = textOf(entry.title, 'en')
  const description = textOf(entry.description, 'zh') || textOf(entry.description, 'en')
  const category = CATEGORY[entry.category] ?? '插件'

  // A Chinese parenthesis usually carries the readable name ("Maid Atelier（深海女仆工坊）").
  for (const match of titleZh.matchAll(/\(([^()]*)\)|（([^（）]*)）/g)) {
    const inside = (match[1] ?? match[2] ?? '').trim()
    if (inside !== '' && CJK.test(inside) && inside.length <= 12) {
      const named = finish(inside, category, description)
      if (CJK.test(named)) return named
    }
  }

  // The index's own Chinese title, with its Latin subject words translated.
  if (CJK.test(titleZh)) {
    const translated = titleZh.replace(/[A-Za-z][A-Za-z0-9+.]*/g, (word) => {
      const mapped = WORDS[word.toLowerCase()]
      return mapped === undefined || mapped === word ? word : mapped
    })
    const named = finish(translated, category, description)
    if (CJK.test(named)) return named
  }

  const words = tokens(titleEn).filter(word => !NOISE.has(word))

  // The title's own words, translated.
  const mapped = []
  for (const word of words) {
    const value = WORDS[word]
    if (value !== undefined && !mapped.includes(value)) mapped.push(value)
  }
  if (mapped.length > 0) {
    const named = finish(mapped.slice(0, 2).join(''), category, description)
    // A title whose only word translates to a bare category ("telemetry" → 安全)
    // names nothing; the description still says what the plugin touches.
    if (!GENERIC.has(named)) return named
    const object = objectName(description)
    if (object !== '' && object !== named) return finish(`${object} · ${named}`, category, description)
    return named
  }

  // The description's own subject: the clause's head, then the object it acts on.
  const functional = functionName(description)
  if (functional !== '') return finish(functional, category, description)
  const object = objectName(description)
  if (object !== '') return finish(object, category, description)

  // The category, so the name is always Chinese and readable.
  return `${category}插件`
}

// ---------------------------------------------------------------- storage

/** The directory holding this machine's market name records. */
function storePath() {
  const home = process.env.DSH_HOME !== undefined && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
  return join(home, 'expert-market', 'plugin-names.json')
}

/** Read the stored map, tolerating a missing or unreadable file. */
async function readStore(ctx) {
  const path = storePath()
  try {
    const raw = await readFile(path, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object' && parsed.names !== null && typeof parsed.names === 'object') {
      const names = {}
      const by = {}
      let repaired = 0
      if (parsed.by !== null && typeof parsed.by === 'object') {
        for (const [name, author] of Object.entries(parsed.by)) {
          if (author === 'rule' || author === 'model') by[name] = author
        }
      }
      let migrated = 0
      for (const [name, value] of Object.entries(parsed.names)) {
        if (nameProblem(value) === null) {
          names[name] = value
          // A name the rules clearly produced may still be improved once by the
          // model, even if an earlier revision had already marked it decided: those
          // revisions wrote the same rule names and stamped them as final.
          if (looksRuleGiven(value)) {
            if (by[name] !== 'rule') { by[name] = 'rule'; migrated += 1 }
          } else if (by[name] === undefined) {
            by[name] = 'model'
          }
        } else {
          repaired += 1
        }
      }
      if (migrated > 0) {
        ctx.logger?.info?.(`expert-market: ${migrated} rule-shaped name(s) may be improved by the model once`)
      }
      if (repaired > 0) {
        ctx.logger?.info?.(`expert-market: ${repaired} stored name(s) are not readable Chinese and will be given again`)
      }
      return { version: STORE_VERSION, names, by }
    }
    ctx.logger?.warn?.(`expert-market: ignoring an unexpected name store at ${path}`)
    return { version: STORE_VERSION, names: {}, by: {} }
  } catch (error) {
    if (error?.code !== 'ENOENT') ctx.logger?.warn?.(`expert-market: could not read ${path}: ${error?.message ?? error}`)
    return { version: STORE_VERSION, names: {}, by: {} }
  }
}

/** Write the map through a temporary file, so a crash never leaves half a record. */
async function writeStore(ctx, store) {
  const path = storePath()
  const temporary = `${path}.${process.pid}.tmp`
  try {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(temporary, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
    await rename(temporary, path)
  } catch (error) {
    ctx.logger?.warn?.(`expert-market: could not save names to ${path}: ${error?.message ?? error}`)
  }
}

// ---------------------------------------------------------------- route

/**
 * The one name record this plugin reads and writes. It is resolved on the first
 * request and shared afterwards, so a name is computed once per package for the
 * lifetime of the process.
 */
/**
 * Why a stored name is unusable, or null when it stands.
 *
 * A name that passes is permanent: it is never recomputed, whatever the index or
 * the naming rules do later. Only a record that is broken Chinese — a fragment cut
 * mid-word, a clause, or a repeated pair — is dropped, so that plugin is given a
 * readable name again; every readable name is kept byte-for-byte.
 */
function nameProblem(value) {
  if (typeof value !== 'string') return 'not-text'
  if (!CJK.test(value)) return 'not-chinese'
  if (value.length < NAME_MIN) return 'too-short'
  if (CUT_TAIL.test(value)) return 'cut-mid-word'
  if (CLAUSE_HEAD.test(value)) return 'clause'
  const repeat = /^(.+?)\s*·\s*(.+)$/.exec(value)
  if (repeat !== null && repeat[1] === repeat[2]) return 'repeated'
  return null
}

/** How long one model naming call may take. */
const MODEL_TIMEOUT_MS = 20000
/** Names per model call: a batch keeps the token cost per plugin small. */
const MODEL_BATCH = 6

/** The instruction that turns a plugin description into one Chinese name. */
const NAME_PROMPT = [
  '你是插件命名助手。给定若干插件的中文介绍，请为每个插件起一个中文名称。',
  '要求：',
  '1. 名称用中文，2 到 8 个字，是名词短语，不是句子，不要以“的、了、和”等虚词开头或结尾。',
  '2. 命名要基于介绍全文，判断这个插件“是什么、做什么”，而不是照抄首句。',
  '3. 名称要能区分同类插件：不要只写“安全插件”“用量插件”这类泛称。',
  '4. 保留产品专名（如 Blender、Notion、GitHub）时可以夹在中文里。',
  '5. 只输出 JSON，形如 {"names":{"包名":"中文名"}}，不要解释。',
].join('\n')

/**
 * Ask the model for a name of each plugin described.
 *
 * The rules answer immediately so the page never waits; this decides the final
 * name by reading each description whole, which is what the rules cannot do.
 * @param ctx the plugin context, for `llm` and `agentDefaultModel`.
 * @param items the plugins to name, each with its package name and full text.
 * @returns a map of package name to name; empty when no model is available.
 */
async function modelNames(ctx, items) {
  const llm = typeof ctx.get === 'function' ? ctx.get('llm') : undefined
  const defaults = typeof ctx.get === 'function' ? ctx.get('agentDefaultModel') : undefined
  if (llm === undefined || defaults === undefined) return {}
  const selection = defaults.currentSelection()
  if (selection?.provider === undefined || selection?.model === undefined) return {}

  const out = {}
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, MODEL_TIMEOUT_MS)
  try {
    for (let at = 0; at < items.length; at += MODEL_BATCH) {
      const batch = items.slice(at, at + MODEL_BATCH)
      const question = batch
        .map((item, index) => `${index + 1}. 包名 ${item.name}\n介绍：${String(item.text ?? '').slice(0, 600)}`)
        .join('\n\n')
      let text = ''
      for await (const chunk of llm.stream({
        provider: selection.provider,
        model: selection.model,
        system: NAME_PROMPT,
        messages: [{ role: 'user', content: [{ type: 'text', text: question }] }],
        maxTokens: 600,
        temperature: 0.2,
        signal: controller.signal,
      })) {
        if (chunk.type === 'text-delta') text += chunk.text
        if (chunk.type === 'finish' && chunk.reason.kind !== 'stop') break
      }
      for (const [name, value] of Object.entries(parseNameReply(text))) {
        if (typeof value === 'string' && CJK.test(value) && value.length >= NAME_MIN && value.length <= 12) {
          out[name] = value
        }
      }
    }
  } catch (error) {
    ctx.logger?.info?.(`expert-market: model naming skipped (${error?.message ?? error})`)
  } finally {
    clearTimeout(timer)
  }
  return out
}

/** Read the JSON the naming prompt asks for, tolerating a fenced block. */
function parseNameReply(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return {}
  try {
    const value = JSON.parse(text.slice(start, end + 1))
    const names = value?.names ?? value
    return names !== null && typeof names === 'object' ? names : {}
  } catch (error) {
    return {}
  }
}

/** Names the model decided; their records are final and must not be refined again. */
const modelDecided = new Set()
/** Names the rule invented for the current request, which the model may still improve. */
const ruleGiven = new Set()

let recordPromise = null

/** Resolve the shared record, reading the stored file at most once. */
function record(ctx) {
  if (recordPromise === null) recordPromise = readStore(ctx)
  return recordPromise
}

/**
 * Answer one naming request.
 * @param ctx the plugin context, for logging and for the store's path.
 */
async function handle(ctx, request, response) {
  const state = await record(ctx)
  if (request.method === 'GET') {
    send(response, 200, { version: STORE_VERSION, names: state.names, by: state.by })
    return
  }
  if (request.method !== 'POST') {
    response.writeHead(405, { allow: 'GET, POST', 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'method-not-allowed' }))
    return
  }
  const body = await readJson(request)
  if (body === null || !Array.isArray(body.entries)) {
    send(response, 400, { error: 'invalid-body' })
    return
  }
  let added = 0
  for (const entry of body.entries.slice(0, 2000)) {
    const name = typeof entry?.name === 'string' ? entry.name : ''
    if (name === '') continue
    // A name, once given, is never recomputed, even when the index changes.
    if (typeof state.names[name] === 'string' && state.names[name] !== '') continue
    state.names[name] = chineseName({
      name,
      title: entry.title,
      description: entry.description,
      category: typeof entry.category === 'string' ? entry.category : '',
    })
    state.by[name] = 'rule'
    ruleGiven.add(name)
    added += 1
  }
  if (added > 0) await writeStore(ctx, state)
  // Refine in the background, whether a name was just invented or an older record is
  // eligible again after a migration: the reply is already on its way, so the page
  // never waits for a model.
  const eligible = body.entries.slice(0, 2000).filter(entry => typeof entry?.name === 'string'
    && state.by[entry.name] === 'rule')
  if (eligible.length > 0) {
    void refineNames(ctx, state, eligible).catch((error) => {
      ctx.logger?.info?.(`expert-market: name refinement skipped (${error?.message ?? error})`)
    })
  }
  send(response, 200, { version: STORE_VERSION, added, names: state.names, by: state.by })
}

/**
 * Replace a rule-given name with the model's reading of the whole description.
 *
 * A name the model decides is final from then on: it is written to the store and
 * never recomputed, exactly like a rule-given one. Only a name this call still owns
 * (the rule's own, unchanged since) is replaced, so a refresh cannot flip a name
 * the reader has already seen.
 * @param ctx the plugin context.
 * @param state the shared name record, already holding the rule names.
 * @param entries the entries the page asked about.
 */
async function refineNames(ctx, state, entries) {
  // Only the names this request invented are eligible. Anything already in the
  // record — given by the rules on an earlier visit, or decided by the model — is a
  // name the reader may have seen, and a name once given is permanent.
  const pending = entries.filter(entry => typeof entry?.name === 'string'
    && entry.name !== ''
    // Rule-given names are refinable; anything else — a model name, or one stored
    // before records carried their author — is final.
    && state.by[entry.name] === 'rule')
  if (pending.length === 0) return
  const named = await modelNames(ctx, pending.map(entry => ({
    name: entry.name,
    text: [entry.title === undefined ? '' : textOf(entry.title, 'zh'), textOf(entry.description, 'zh')].join('\n'),
  })))
  let changed = 0
  for (const [name, value] of Object.entries(named)) {
    const current = state.names[name]
    // Only a record still holding a rule name is eligible: once the model named it,
    // the record is authoritative and a second pass must not touch it.
    if (typeof current !== 'string' || state.by[name] !== 'rule') continue
    if (value === current) continue
    state.names[name] = value
    state.by[name] = 'model'
    modelDecided.add(name)
    changed += 1
  }
  if (changed > 0) await writeStore(ctx, state)
}

/** Write a JSON response. */
function send(response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

/** Read a bounded JSON request body. */
function readJson(request) {
  return new Promise((resolve) => {
    const chunks = []
    let size = 0
    let closed = false
    const finish = (value) => { if (!closed) { closed = true; resolve(value) } }
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) { finish(null); request.destroy(); return }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        finish(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        finish(null)
      }
    })
    request.on('error', () => { finish(null) })
  })
}

// ---------------------------------------------------------------- plugin

/** Host plugin body: one route over the persisted name records. */
export function apply(ctx) {
  // Start reading the stored names at activation so the first request answers from
  // memory; `record()` shares that one read across every request.
  void record(ctx)
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: ROUTE,
      handler: (request, response) => {
        handle(ctx, request, response).catch((error) => {
          ctx.logger?.warn?.(`expert-market: naming request failed: ${error?.message ?? error}`)
          if (!response.headersSent) send(response, 500, { error: 'naming-failed' })
          else response.end()
        })
      },
    }), 'expert-market: naming route')
  })
}

/** Services this plugin can use when the profile composes them. */
export const inject = []
