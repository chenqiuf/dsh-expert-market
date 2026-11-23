
    /** Locale namespace of this page. */
    const NS = 'expertMarket'
    /** Main-panel key and sidebar entry id; one value so the panel and its icon stay paired. */
    const PANEL_ID = 'expert-market'
    /** The largest page the Host accepts: its query schema refuses anything above 100. */
    const HOST_PAGE_LIMIT = 100
    /** How many host pages one Chinese-name search will read before giving up. */
    const LOCAL_SEARCH_PAGES = 20

    /** Entries per page: a page is what a reader scans before choosing, and 24 keeps
     *  the grid one comfortable screenful at a typical window width. */
    const PAGE_SIZE = 24
    /** Entries read per hero category for its quick links. */
    const HERO_ENTRIES = 3
    /** Typing pause before a text query is sent. */
    const TEXT_DELAY_MS = 250
    /** Category ids preferred for the hero row, in display order; missing ones fall back to the busiest categories. */
    const HERO_CATEGORIES = ['interface', 'appearance', 'tools', 'skills', 'memory', 'providers', 'workflow']
    /** Category cards per row on a wide page; the row always shows this many. */
    const HERO_COLUMNS = 6
    /** Rows of category cards: one row keeps the page short. */
    const HERO_ROWS = 1
    /** Icons are 64px in the card head, unlike the 36px frame of the native list. */
    const CARD_ICON = 40
    /** Detail page portrait size. */
    const DETAIL_ICON = 88

    const INITIAL_QUERY = { text: '', category: null, labels: [], sort: { kind: 'index' } }

    /** The page's two views: the market catalogue, and the plugins already installed. */
    const VIEW_MARKET = 'market'
    const VIEW_INSTALLED = 'installed'

    /** The client-side filters of the list: applied to the page the Host returned. */
    const INITIAL_FILTER = { heat: 'any', stars: 'any', age: 'any', installed: 'any' }

    // ---------------------------------------------------------------- dictionaries

    const zh = {
      nav: '精选市场',
      title: '精选市场',
      tabMarket: '更多精选插件',
      tabInstalled: '已安装',
      installedTitle: '已安装插件',
      installedHint: '在这里启用、停用或卸载插件；随 DSH 提供的插件不能卸载。',
      installedCount: '{count} 个',
      installedLoading: '正在读取已安装插件…',
      installedFailed: '读取已安装插件失败',
      installedEmpty: '还没有安装任何插件',
      installedEmptyHint: '回到「逛插件」，挑一个装上。',
      installedUnsupported: '当前配置没有插件管理服务',
      groupUpdate: '有可用更新',
      groupOn: '已启用',
      groupOff: '已停用',
      groupShipped: 'DSH 自带',
      originShipped: 'DSH 自带',
      originThirdParty: '第三方',
      updateCheck: '检查更新',
      updateChecking: '检查中…',
      updateAvailable: '可更新 {version}',
      updateTo: '更新到 {version}',
      updateNone: '已是最新版本',
      updateAll: '全部更新（{count}）',
      updating: '正在更新 {done}/{total}：{name}',
      updateDone: '更新完成：成功 {ok} 个',
      updatePartial: '更新完成：成功 {ok} 个，失败 {bad} 个',
      updateFailedRow: '{name}：{reason}',
      updateDismiss: '关闭',
      updateNotChecked: '尚未检查更新',
      detailOf: '插件详情',
      backToInstalled: '返回已安装',
      installedDocMissing: '这个插件没有附带说明文档。',
      installedDocFailed: '说明文档读取失败',
      colName: '插件',
      colVersion: '版本',
      colCategory: '分类',
      colState: '状态',
      colActions: '操作',
      stateEnabled: '已启用',
      stateDisabled: '已停用',
      stateShipped: 'DSH 自带',
      actionEnable: '启用',
      actionDisable: '停用',
      actionRemove: '卸载',
      actionWorking: '处理中…',
      actionConfirmRemove: '确认卸载',
      actionCancel: '取消',
      shippedHint: '随 DSH 提供，不能卸载',
      rowError: '无法更改：{reason}',
      backToMarket: '去逛插件',
      subtitle: '按场景逛插件：分类大卡选方向，卡片看细节，点开就是一页说明书。',
      search: '搜索插件名或中文名',
      searchLabel: '搜索插件',
      indexCurrent: '当前选中',
      indexMenu: '插件源',
      indexManage: '添加或删除插件源…',
      indexAddPlaceholder: 'https://example.com/index.json',
      indexAdd: '添加',
      indexRemove: '移除',
      indexRemoveNamed: '移除 {url}',
      indexFailed: '无法修改插件源：{reason}',
      indexEmpty: '还没有插件源',
      indexBroken: '这个源读取失败',
      indexMenuLabel: '切换插件市场索引，当前 {market}',
      refresh: '刷新',
      retry: '重试',
      loading: '正在读取插件源…',
      browse: '逛插件',
      sort: '排序',
      sortIndex: '综合',
      sortPublished: '最新',
      sortRelevance: '最相关',
      all: '全部',
      categoriesLabel: '插件分类',
      heroTitle: '按场景开始',
      hotTitle: '最新热门',
      hotHint: '这段时间里既有热度、又是新上架的插件',
      filter: '筛选',
      filterHeat: '热度',
      filterStars: '星数',
      filterAge: '发布时间',
      filterInstalled: '安装状态',
      filterReset: '重置筛选',
      filterMore: '更多筛选',
      filterLess: '收起筛选',
      filterMoreCount: '更多筛选 ({count})',
      filterAny: '不限',
      heat1k: '1000+',
      heat100: '100+',
      heat10: '10+',
      stars1k: '1000+',
      stars100: '100+',
      stars10: '10+',
      age7: '7 天内',
      age30: '30 天内',
      age90: '90 天内',
      installedOnly: '已安装',
      notInstalled: '未安装',
      filterEmpty: '没有符合筛选条件的插件。',
      pagePrev: '上一页',
      pageNext: '下一页',
      pageOf: '第 {page} / {pages} 页',
      pagerLabel: '分页',
      fromCacheHint: '显示的是上次读到的结果，正在更新…',
      heroMore: '查看全部',
      heroCount: '{count} 个插件',
      emptySource: '还没有可用的插件源',
      emptySourceHint: '先在「插件」页的「发现」标签里添加一个索引地址。',
      loadingList: '正在刷新列表…',
      noMatch: '没有匹配的插件，换个关键词试试。',
      openPlugins: '去插件页管理',
      askUnavailable: '当前环境不支持发起会话',
      unsupported: '插件市场服务未启用',
      unsupportedHint: '当前配置没有挂载 pluginMarket 服务，因此读不到任何索引。',
      failedIndexes: '读取插件源失败',
      failedListing: '读取这个插件源失败',
      entryMeta: 'v{version} · {date}',
      installed: '已安装',
      install: '安装',
      update: '更新',
      provided: '随 DSH 提供',
      blocked: '版本不兼容',
      back: '返回列表',
      backLabel: '返回插件列表',
      whatItDoes: '这个插件能做什么',
      detailFallback: '这个插件没有读到说明文档。',
      detailLoading: '正在读取说明…',
      detailFailed: '说明读取失败',
      more: '更多',
      factVersion: '版本',
      factStars: '星标',
      factAuthor: '作者',
      factSource: '来源',
      factPackage: '包名',
      factRegistry: '源',
      factRepository: '仓库',
      factCommit: '提交',
      factDirectory: '目录',
      factPublished: '发布时间',
      factHomepage: '主页',
      noData: '—',
      installDialog: '安装插件',
      installConfirm: '确认后开始安装',
      installRun: '开始安装',
      installSpec: '安装来源',
      installTrust: '插件在本机以你的权限运行，请确认来源可信。安装后它会立刻启用。',
      installPhaseStarting: '正在准备…',
      installPhaseInstalling: '正在下载并安装…',
      installPhaseApplying: '正在启用…',
      installPhaseCancelling: '正在取消…',
      installPhaseDone: '安装完成',
      installPhaseFailed: '安装失败',
      installPhaseCancelled: '已取消',
      installPhaseUnknown: '结果未知',
      installLog: '安装日志',
      installCancel: '取消安装',
      installClose: '关闭',
      installRetry: '重试',
      installRestart: '需要重启 DSH 才能完全生效。',
      installOpenInstalled: '打开已安装列表',
      installBuilds: '这个包要执行安装脚本：{names}',
      installApprove: '允许并继续',
      installCancelledTooLate: '已经开始启用，无法取消。',
      answer: '问 AI 怎么用',
      answerPrompt: '请介绍一下插件 {name} 的用途、怎么配置，以及有没有需要注意的兼容性问题。',
      installHint: '安装后立即启用',
    }

    const en = {
      nav: 'Curated market',
      title: 'Curated market',
      tabMarket: 'More curated plugins',
      tabInstalled: 'Installed',
      installedTitle: 'Installed plugins',
      installedHint: 'Enable, disable, or remove plugins here; bundles that ship with DSH cannot be removed.',
      installedCount: '{count}',
      installedLoading: 'Reading installed plugins…',
      installedFailed: 'Could not read the installed plugins',
      installedEmpty: 'No plugin is installed yet',
      installedEmptyHint: 'Go back to Browse and install one.',
      installedUnsupported: 'This profile has no plugin management service',
      groupUpdate: 'Updates available',
      groupOn: 'Enabled',
      groupOff: 'Stopped',
      groupShipped: 'Ships with DSH',
      originShipped: 'Ships with DSH',
      originThirdParty: 'Third-party',
      updateCheck: 'Check for updates',
      updateChecking: 'Checking…',
      updateAvailable: 'Update to {version}',
      updateTo: 'Update to {version}',
      updateNone: 'Up to date',
      updateAll: 'Update all ({count})',
      updating: 'Updating {done}/{total}: {name}',
      updateDone: 'Updated {ok}',
      updatePartial: 'Updated {ok}, {bad} failed',
      updateFailedRow: '{name}: {reason}',
      updateDismiss: 'Close',
      updateNotChecked: 'Updates not checked yet',
      detailOf: 'Plugin details',
      backToInstalled: 'Back to installed',
      installedDocMissing: 'This plugin ships no document.',
      installedDocFailed: 'Could not read the document',
      colName: 'Plugin',
      colVersion: 'Version',
      colCategory: 'Category',
      colState: 'State',
      colActions: 'Actions',
      stateEnabled: 'Enabled',
      stateDisabled: 'Disabled',
      stateShipped: 'Ships with DSH',
      actionEnable: 'Enable',
      actionDisable: 'Disable',
      actionRemove: 'Remove',
      actionWorking: 'Working…',
      actionConfirmRemove: 'Confirm removal',
      actionCancel: 'Cancel',
      shippedHint: 'Ships with DSH, so it cannot be removed',
      rowError: 'Could not change it: {reason}',
      backToMarket: 'Browse plugins',
      subtitle: 'Browse by situation: pick a category card, scan the cards, and open one for a full page of facts.',
      search: 'Search by plugin name or Chinese name',
      searchLabel: 'Search plugins',
      indexCurrent: 'Current',
      indexMenu: 'Plugin source',
      indexManage: 'Add or remove sources…',
      indexAddPlaceholder: 'https://example.com/index.json',
      indexAdd: 'Add',
      indexRemove: 'Remove',
      indexRemoveNamed: 'Remove {url}',
      indexFailed: 'Could not change the sources: {reason}',
      indexEmpty: 'No plugin source yet',
      indexBroken: 'This source failed to load',
      indexMenuLabel: 'Switch plugin index, currently {market}',
      refresh: 'Refresh',
      retry: 'Retry',
      loading: 'Reading plugin indexes…',
      browse: 'Plugins',
      sort: 'Sort',
      sortIndex: 'Featured',
      sortPublished: 'Newest',
      sortRelevance: 'Best match',
      all: 'All',
      categoriesLabel: 'Plugin categories',
      heroTitle: 'Start from a situation',
      hotTitle: 'New and popular',
      hotHint: 'Recently published plugins the index ranks as popular',
      filter: 'Filter',
      filterHeat: 'Traction',
      filterStars: 'Stars',
      filterAge: 'Published',
      filterInstalled: 'Installed',
      filterReset: 'Reset filters',
      filterMore: 'More filters',
      filterLess: 'Fewer filters',
      filterMoreCount: 'More filters ({count})',
      filterAny: 'Any',
      heat1k: '1000+',
      heat100: '100+',
      heat10: '10+',
      stars1k: '1000+',
      stars100: '100+',
      stars10: '10+',
      age7: 'Last 7 days',
      age30: 'Last 30 days',
      age90: 'Last 90 days',
      installedOnly: 'Installed',
      notInstalled: 'Not installed',
      filterEmpty: 'No plugin matches these filters.',
      pagePrev: 'Previous',
      pageNext: 'Next',
      pageOf: 'Page {page} of {pages}',
      pagerLabel: 'Pagination',
      fromCacheHint: 'Showing the last read result, refreshing…',
      heroMore: 'See all',
      heroCount: '{count} plugins',
      emptySource: 'No usable plugin source yet',
      emptySourceHint: 'Add an index URL under Discover on the Plugins page first.',
      loadingList: 'Refreshing the list…',
      noMatch: 'No plugin matches. Try another keyword.',
      openPlugins: 'Open the Plugins page',
      askUnavailable: 'Starting a session is not available here',
      unsupported: 'The plugin market service is not enabled',
      unsupportedHint: 'This profile mounts no pluginMarket service, so no index can be read.',
      failedIndexes: 'Could not read the plugin sources',
      failedListing: 'Could not read this plugin source',
      entryMeta: 'v{version} · {date}',
      installed: 'Installed',
      install: 'Install',
      update: 'Update',
      provided: 'Provided by DSH',
      blocked: 'Incompatible',
      back: 'Back',
      backLabel: 'Back to the plugin list',
      whatItDoes: 'What this plugin does',
      detailFallback: 'No document was found for this plugin.',
      detailLoading: 'Reading the document…',
      detailFailed: 'Could not read the document',
      more: 'More',
      factVersion: 'Version',
      factStars: 'Stars',
      factAuthor: 'Author',
      factSource: 'Source',
      factPackage: 'Package',
      factRegistry: 'Registry',
      factRepository: 'Repository',
      factCommit: 'Commit',
      factDirectory: 'Directory',
      factPublished: 'Published',
      factHomepage: 'Homepage',
      noData: '—',
      installDialog: 'Install plugin',
      installConfirm: 'Ready to install',
      installRun: 'Install now',
      installSpec: 'Install source',
      installTrust: 'Plugins run on this machine with your permissions. Make sure you trust this one. It is enabled right after installation.',
      installPhaseStarting: 'Preparing…',
      installPhaseInstalling: 'Downloading and installing…',
      installPhaseApplying: 'Enabling…',
      installPhaseCancelling: 'Cancelling…',
      installPhaseDone: 'Installed',
      installPhaseFailed: 'Installation failed',
      installPhaseCancelled: 'Cancelled',
      installPhaseUnknown: 'Outcome unknown',
      installLog: 'Install log',
      installCancel: 'Cancel install',
      installClose: 'Close',
      installRetry: 'Retry',
      installRestart: 'Restart DSH to finish enabling it.',
      installOpenInstalled: 'Open the installed list',
      installBuilds: 'This package runs install scripts: {names}',
      installApprove: 'Allow and continue',
      installCancelledTooLate: 'Enabling has started, so it can no longer be cancelled.',
      answer: 'Ask AI how to use it',
      answerPrompt: 'Explain what the plugin {name} is for, how to configure it, and any compatibility issues I should know about.',
      installHint: 'Enabled right after installation',
    }

    // ---------------------------------------------------------------- small utilities

    /** Join truthy class names. */
    function cls() {
      let out = ''
      for (const part of arguments) if (part) out = out === '' ? part : `${out} ${part}`
      return out
    }

    /** Fill `{name}` placeholders of a dictionary line. */
    function fill(line, values) {
      if (values === undefined) return line
      return line.replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole))
    }

    /**
     * The Chinese description of an entry. The index publishes one for nearly
     * every plugin; when it does not, the reader still sees Chinese rather than
     * an English sentence inside a Chinese page.
     */
    function chineseText(value, language) {
      const zh = textOf(value, 'zh')
      if (zh !== '') return zh
      return textOf(value, language)
    }

    /** Read a string out of a possibly localized index value. */
    function textOf(value, language) {
      if (value === undefined || value === null) return ''
      if (typeof value === 'string') return value
      if (typeof value !== 'object') return String(value)
      if (typeof value[language] === 'string') return value[language]
      const base = language.split('-')[0]
      if (typeof value[base] === 'string') return value[base]
      if (typeof value.en === 'string') return value.en
      for (const candidate of Object.values(value)) if (typeof candidate === 'string') return candidate
      return ''
    }

    /** Trim a description to a readable length without cutting mid-word where possible. */
    function trim(text, max) {
      if (text.length <= max) return text
      const cut = text.slice(0, max)
      const space = cut.lastIndexOf(' ')
      return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[，,、;；:：.\s]+$/u, '')}…`
    }

    /** Format a publish timestamp in the reader's language. */
    function formatDate(seconds, language) {
      if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return ''
      try {
        return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(seconds * 1000))
      } catch (error) {
        return ''
      }
    }

    /** Compact numbers: 12800 → 1.28万 in Chinese, 12.8k in English. */
    function compactNumber(value, language) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return ''
      if (language.startsWith('zh')) {
        if (value >= 100000000) return `${(value / 100000000).toFixed(2).replace(/\.?0+$/, '')}亿`
        if (value >= 10000) return `${(value / 10000).toFixed(2).replace(/\.?0+$/, '')}万`
        return String(value)
      }
      if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
      return String(value)
    }

    /** A readable message for anything thrown or returned as a Remote failure. */
    function messageOf(error) {
      if (error === undefined || error === null) return ''
      if (typeof error === 'string') return error
      if (typeof error.message === 'string' && error.message !== '') return error.message
      if (typeof error.code === 'string') return error.code
      try { return JSON.stringify(error) } catch (thrown) { return String(error) }
    }

    /** The presented version of one entry. */
    function versionOf(entry) {
      const versions = Array.isArray(entry.versions) ? entry.versions : []
      return versions.find(item => item.version === entry.defaultVersion) ?? versions[0]
    }

    /** A numeric popularity figure the index really publishes, or undefined. */
    function starsOf(entry) {
      const keys = entry.metadata?.sortKeys
      if (keys === undefined || keys === null || typeof keys !== 'object') return undefined
      for (const [key, value] of Object.entries(keys)) {
        if (typeof value === 'number' && Number.isFinite(value) && /star|download|install|use|popular/i.test(key)) return value
      }
      return undefined
    }

    /** A stable accent per entry name, so a plugin keeps the same cover without an icon. */
    function accentOf(name) {
      let sum = 0
      for (let index = 0; index < name.length; index += 1) sum = (sum * 31 + name.charCodeAt(index)) % 360
      return sum
    }

    // ---------------------------------------------------------------- first-paint cache

    /**
     * The last index this browser read, kept between page loads.
     *
     * The Host caches a fetched index in its own memory, so a reload within ten
     * minutes costs nothing — but a restart, or the first open after one, pays the
     * full download again (two seconds on the fastest public index). This keeps the
     * last answer in `localStorage` so a cold start can paint from it immediately and
     * refresh behind the reader.
     *
     * Only the parts the page renders are stored: the entries of one page, the index
     * header, and the time it was read. Nothing derived from the profile is cached.
     */
    const CACHE_PREFIX = 'dem-market-cache:'
    /** How long a stored answer is used as first paint before it is considered stale. */
    const CACHE_MAX_AGE_MS = 30 * 60 * 1000

    /** Read a stored answer for one index and query, or undefined. */
    function readCache(key) {
      try {
        const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`)
        if (raw === null) return undefined
        const value = JSON.parse(raw)
        if (value === null || typeof value !== 'object') return undefined
        if (typeof value.storedAt !== 'number' || Date.now() - value.storedAt > CACHE_MAX_AGE_MS) {
          window.localStorage.removeItem(`${CACHE_PREFIX}${key}`)
          return undefined
        }
        if (!Array.isArray(value.listing?.entries) || typeof value.listing?.url !== 'string') return undefined
        return value
      } catch (error) {
        // A private window or a full quota simply means no cache.
        return undefined
      }
    }

    /** Store one answer, dropping older keys so the bucket cannot grow without bound. */
    function writeCache(key, value) {
      try {
        window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value))
        const keys = []
        for (let at = 0; at < window.localStorage.length; at += 1) {
          const name = window.localStorage.key(at)
          if (name !== null && name.startsWith(CACHE_PREFIX)) keys.push(name)
        }
        // Three entries cover the two configured indexes and one query variant.
        for (const name of keys.slice(0, Math.max(0, keys.length - 3))) window.localStorage.removeItem(name)
      } catch (error) {
        // Storage refused the write: the page simply starts cold next time.
      }
    }

    /** The cache key of one index and query: same source, same filters, same page. */
    function cacheKey(url, query, offset) {
      return JSON.stringify([url, query?.text ?? '', query?.category ?? null, query?.labels ?? [], query?.sort ?? null, offset ?? 0])
    }

    // ---------------------------------------------------------------- store

    /** A minimal snapshot store with `useSyncExternalStore` support. */
    function createStore(initial) {
      let state = initial
      const listeners = new Set()
      return {
        get: () => state,
        set(next) {
          if (Object.is(next, state)) return
          state = next
          for (const listener of [...listeners]) listener()
        },
        patch(part) {
          this.set({ ...state, ...part })
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      }
    }

    /** Subscribe a component to a store snapshot. */
    function useStore(store) {
      return useSyncExternalStore(store.subscribe, store.get, store.get)
    }

    const EMPTY_INSTALL = {
      open: false, phase: 'idle', requestId: null, entry: null, version: null, spec: '',
      title: '', registry: null, runs: [], log: '', result: null, failure: null,
      pendingBuilds: [], cancelling: false, restartRequired: false, note: null,
    }

    const INITIAL_STATE = {
      status: 'idle',            // idle | loading | ready | error | unsupported | empty
      failure: null,             // indexes | listing
      reason: '',                // the Host's own message for a failure
      indexes: [],
      url: null,
      listing: null,
      query: INITIAL_QUERY,
      filter: INITIAL_FILTER,
      hero: [],
      heroLoading: false,
      hot: [],                 // the front row: freshest plugins with real traction
      hotLoading: false,
      detail: {},                // key → { status, detail, language }
      names: {},                 // package name → the Chinese name given once and kept
      install: EMPTY_INSTALL,
      paging: false,
      offset: 0,
      fromCache: false,     // the list on screen was painted from the stored answer
      view: VIEW_INSTALLED,
      installed: {
        status: 'idle',        // idle | loading | ready | error
        reason: '',
        rows: [],
        busy: null,            // package name of the row being changed
        failure: '',           // last change failure, for the row it names
        failureName: '',
        // Update state. `checked` says whether this view has asked the registries;
        // `updates` maps a package name to the newest compatible version offered.
        checked: false,
        checking: false,
        // The plugin whose page is open in this view, and its document state.
        opened: null,
        document: null,        // { status: loading | ready | error, markdown, reason }
        checkReason: '',
        updates: {},
        // A batch runs one package at a time, because every update rewrites the same
        // profile manifest and lockfile.
        batch: null,           // { total, done, current, succeeded, failed: [{ name, reason }] }
      },
    }

    // ---------------------------------------------------------------- controller

    /** Reads the configured market indexes and drives installs; owns no React state. */
    class MarketController {
      /**
       * @param {object} ctx the plugin context, for `remote`, `locale`, and disposal.
       * @param {(key: string, values?: object) => string} t the page dictionary.
       */
      constructor(ctx, t) {
        this.ctx = ctx
        this.t = t
        this.store = createStore(INITIAL_STATE)
        // Remote namespaces appear only after the gateway mounts them; read them on first
        // use rather than in the constructor, so a page opened early still finds them.
        const remote = () => ctx.get('remote')
        this.marketOf = () => remote()?.pluginMarket
        this.managerOf = () => remote()?.pluginManager
        this.started = false
        this.timer = null
        this.disposed = false
      }

      /** The dictionary of the current state. */
      get snapshot() { return this.store.get() }

      patch(part) { this.store.patch(part) }

      language() {
        try { return this.ctx.locale.getLocale().active ?? 'en' } catch (error) { return 'en' }
      }

      /** Load the index list once, then the first page. */
      async ensure() {
        if (this.started) return
        // The installed count is local, so it loads beside the catalogue rather than
        // waiting for it.
        this.primeInstalled()
        // The Remote namespace can mount after this page's first mount; wait for it briefly
        // instead of latching the unsupported state on a page that opened too early.
        if (this.marketOf() === undefined && this.ctx.remoteAccess !== undefined) {
          let off = () => {}
          let timer = null
          const ready = await new Promise((resolve) => {
            // `whenAccess` reconciles the current state and re-runs on every change, so it
            // reports the capability once the gateway has mounted it.
            try {
              off = this.ctx.remoteAccess.whenAccess('pluginMarket/search', function* () { resolve(true); yield () => {} }) ?? (() => {})
            } catch (error) {
              resolve(false)
              return
            }
            timer = setTimeout(() => { resolve(false) }, 8000)
          })
          if (timer !== null) clearTimeout(timer)
          off()
          if (this.disposed) return
          if (ready !== true || this.marketOf() === undefined) {
            if (!this.disposed) this.patch({ status: 'unsupported' })
            return
          }
        }
        this.started = true
        if (this.marketOf() === undefined) {
          this.patch({ status: 'unsupported' })
          return
        }
        // Show the frame immediately: the skeleton is what the reader sees while the
        // index document downloads, which is the one slow step on a cold cache.
        this.patch({ status: 'loading', heroLoading: true })
        let indexes = []
        try {
          const answer = await this.marketOf().listIndexes()
          if (!answer.ok) throw answer.error ?? new Error('listIndexes failed')
          indexes = Array.isArray(answer.value) ? answer.value : []
        } catch (error) {
          if (!this.disposed) this.patch({ status: 'error', failure: 'indexes', reason: messageOf(error) })
          return
        }
        if (this.disposed) return
        const usable = indexes.filter(index => index.error === undefined)
        const chosen = usable[0] ?? indexes[0]
        this.patch({ indexes })
        if (chosen === undefined) {
          this.patch({ status: 'empty', failure: null })
          return
        }
        await this.load(chosen.url, INITIAL_QUERY)
      }

      /**
       * Ask the Host for the Chinese names of the entries now on screen.
       *
       * The Host owns naming: it gives each package one Chinese name, stores it,
       * and never recomputes it, so a name survives index rebuilds, page reloads,
       * and new versions. An entry that disappears simply stops being asked about.
       */
      async refreshNames(entries) {
        if (!Array.isArray(entries) || entries.length === 0) return
        // Only ask for names this page does not already hold: paging and category
        // visits overlap heavily, and a repeat post costs a round trip each time.
        const known = this.store.get().names
        const asked = this.namesAsked ?? new Set()
        const wanted = entries.filter(entry => !(typeof known[entry.name] === 'string' && known[entry.name] !== '') && !asked.has(entry.name))
        if (wanted.length === 0) return
        for (const entry of wanted) asked.add(entry.name)
        this.namesAsked = asked
        const payload = wanted.slice(0, 2000).map(entry => ({
          name: entry.name,
          title: entry.title,
          description: entry.description,
          category: entry.metadata?.category ?? '',
        }))
        try {
          const response = await fetch('/expert-market/names', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ entries: payload }),
          })
          if (!response.ok) return
          const answer = await response.json()
          if (this.disposed) return
          if (answer !== null && typeof answer === 'object' && answer.names !== null && typeof answer.names === 'object') {
            this.patch({ names: { ...this.store.get().names, ...answer.names } })
          }
        } catch (error) {
          // A page opened before the Host route exists keeps the raw titles; the next
          // read tries again, and no name is invented on the client.
          for (const entry of wanted) asked.delete(entry.name)
        }
      }

      /** The Chinese name of one entry, falling back to its own title while the Host answers. */
      nameOf(entry, language) {
        const given = this.store.get().names[entry.name]
        if (typeof given === 'string' && given !== '') return given
        return textOf(entry.title, language) || entry.name
      }

      /** The day number used by the daily rotation. */
      today() {
        return Math.floor(Date.now() / 86400000)
      }

      /**
       * Shuffle a list deterministically for one day.
       *
       * While there are more usable categories than seats, the row rotates by day:
       * every category gets an airing, and the page is not the same every morning.
       * The result depends only on the list and the day, so a reload within the same
       * day shows the same row.
       * @param ids the candidate category ids, in preference order.
       * @param day the day number.
       * @returns a reordered copy of `ids`.
       */
      seededOrder(ids, day) {
        const pool = [...ids]
        let state = day
        for (let at = pool.length - 1; at > 0; at -= 1) {
          state = (state * 1103515245 + 12345) % 2147483648
          const swap = state % (at + 1)
          const held = pool[at]
          pool[at] = pool[swap]
          pool[swap] = held
        }
        return pool
      }

      /** Read one page of one index. */
      async load(url, query, options) {
        if (this.marketOf() === undefined) return
        // A page is a window into the result set: `offset` names its first entry.
        const offset = options?.offset ?? 0
        // Paint a stored answer first: a cold process would otherwise wait two seconds
        // on the download. The live read below replaces it either way, so this only
        // ever shortens the wait.
        if (options?.refresh !== true) {
          const stored = readCache(cacheKey(url, query, offset))
          if (stored !== undefined && this.store.get().listing === null) {
            this.patch({
              status: 'ready', failure: null, url, query, paging: false, offset,
              listing: stored.listing, fromCache: true,
            })
            void this.refreshNames(stored.listing.entries)
          }
        }
        this.patch({
          status: this.store.get().listing === null ? 'loading' : 'refreshing',
          failure: null, reason: '', paging: offset > 0,
        })
        // A Chinese query is resolved locally: the Host indexes the source's own
        // fields and cannot see the names this plugin invented. Asking it for the
        // whole index once is cheaper than scanning it again on every keystroke.
        const chineseQuery = /[\u4e00-\u9fff]/.test(String(query.text ?? ''))
        const request = {
          text: chineseQuery ? '' : query.text,
          labels: query.labels,
          sort: query.sort,
          offset: chineseQuery ? 0 : offset,
          limit: chineseQuery ? HOST_PAGE_LIMIT : Math.min(PAGE_SIZE, HOST_PAGE_LIMIT),
          ...query.category === null ? {} : { category: query.category },
        }
        let answer
        try {
          answer = await this.marketOf().search(url, request)
          // A Chinese query needs the whole index to filter, and the Host caps one
          // page at 100. It pages through, stopping on a short page; a cached document
          // makes these reads cheap after the first one.
          if (chineseQuery && answer !== null && answer !== undefined && answer.ok === true
            && Array.isArray(answer.value?.entries) && answer.value.entries.length === HOST_PAGE_LIMIT) {
            const collected = [...answer.value.entries]
            let cursor = answer.value.nextOffset
            for (let page = 1; page < LOCAL_SEARCH_PAGES && cursor !== null && cursor !== undefined; page += 1) {
              const next = await this.marketOf().search(url, { ...request, offset: cursor })
              if (next === null || next === undefined || next.ok !== true
                || !Array.isArray(next.value?.entries) || next.value.entries.length === 0) break
              collected.push(...next.value.entries)
              cursor = next.value.nextOffset
              if (next.value.entries.length < HOST_PAGE_LIMIT) break
            }
            answer = { ok: true, value: { ...answer.value, entries: collected, total: collected.length, nextOffset: null } }
          }
        } catch (error) {
          answer = { ok: false, error }
        }
        if (answer === undefined || answer === null) answer = { ok: false, error: { message: 'no reply' } }
        if (this.disposed) return
        if (!answer.ok) {
          this.patch({ status: 'error', failure: 'listing', reason: messageOf(answer.error), paging: false, query, url })
          return
        }
        const value = answer.value
        let entries = value.entries
        let total = value.total
        let nextOffset = value.nextOffset
        if (chineseQuery) {
          // Remember the unfiltered set so later keystrokes filter it again without
          // another read.
          this.fullListing = { url: value.url, entries }
          const picked = this.localChinesePage(entries, query) ?? []
          entries = picked
          total = picked.length
          nextOffset = null
        }
        // Fill the page in the order it is read: the category row first, then the
        // popular names, then the grid. The index header arrives with this answer, so
        // the cards need no extra round trip to appear.
        const listing = {
          url: value.url,
          title: value.title,
          description: value.description,
          metadata: value.metadata,
          entries,
          total,
          nextOffset,
          fetchedAt: value.fetchedAt,
        }
        const firstPaint = options?.refresh === true || this.heroFor !== value.url
        if (firstPaint) this.heroFor = value.url
        void this.refreshNames(entries)
        // The catalogue lands first: it is what the reader came for, and it needs no
        // extra read. The category cards follow, because they need their own reads,
        // and the popular names last.
        writeCache(cacheKey(url, query, offset), { storedAt: Date.now(), listing })
        this.patch({
          status: 'ready', failure: null, url, query, paging: false, offset, listing, fromCache: false,
        })
        if (firstPaint) {
          void this.refreshHero({ url: value.url, metadata: value.metadata })
          void this.refreshHot(value.url)
        }
        void (async () => {
          if (this.disposed || (this.store.get().url ?? null) !== value.url) return
          // Warm the other source only after the visible work.
          for (const index of this.store.get().indexes) {
            if (index.error === undefined && index.url !== value.url) {
              const run = () => { this.warmIndex(index.url) }
              if (this.ctx.timer?.timeout !== undefined) this.ctx.timer.timeout(run, 2500)
              else setTimeout(run, 2500)
            }
          }
        })()
      }

      /**
       * The front row: the freshest plugins that also carry real traction.
       *
       * The index can order by publish date but not by "new and popular" at once,
       * so the page reads the newest page and ranks it here on the popularity
       * figure the index publishes. Plugins without a figure keep out of the row
       * rather than posing as popular.
       */
      async refreshHot(url) {
        if (this.marketOf() === undefined) return
        // A row may only publish while the page still reads the index it started on,
        // and while no newer source switch has happened since this read began.
        const generation = this.generation ?? 0
        const stillCurrent = () => (this.store.get().url ?? null) === url
          && (this.generation ?? 0) === generation
        const cachedHot = this.hotCache?.get(url)
        if (cachedHot !== undefined) {
          if (stillCurrent()) this.patch({ hot: cachedHot, hotLoading: false })
          return
        }
        if (!stillCurrent()) return
        // A stale row from another index must not stay on screen while this one reads.
        if (this.store.get().hot.length > 0 && this.hotUrl !== url) this.patch({ hot: [], hotLoading: true })
        const keys = Object.keys(this.store.get().listing?.metadata?.sortKeys ?? {})
        const popularity = keys.find(key => /star|download|install|use|popular|recommend/i.test(key))
        this.patch({ hotLoading: true })
        let newest
        try {
          newest = await this.marketOf().search(url, {
            labels: [], sort: { kind: 'published', direction: 'desc' }, offset: 0, limit: 100,
          })
        } catch (error) {
          newest = { ok: false }
        }
        if (this.disposed || !stillCurrent()) return
        if (!newest.ok || !Array.isArray(newest.value?.entries)) {
          this.patch({ hot: [], hotLoading: false })
          return
        }
        const scored = newest.value.entries
          .map(entry => ({ entry, heat: popularity === undefined ? 0 : Number(entry.metadata?.sortKeys?.[popularity] ?? 0) }))
          .filter(item => Number.isFinite(item.heat))
        // Newest first, then traction: a row of this period's standouts, not the
        // all-time leaders that the star sort already offers.
        scored.sort((a, b) => b.heat - a.heat)
        const picked = scored.filter(item => item.heat > 0).slice(0, 16)
        const withHeat = picked.length >= 8 ? picked : scored.slice(0, 16)
        const hot = withHeat.map(item => ({ entry: item.entry, heat: item.heat }))
        if (this.hotCache === undefined) this.hotCache = new Map()
        this.hotCache.set(url, hot)
        this.hotUrl = url
        this.patch({ hot, hotLoading: false })
        void this.refreshNames(withHeat.map(item => item.entry))
      }

      /** Read the busiest categories and their quick links for the hero row. */
      async refreshHero(page) {
        // Captured at the start: a source switch while this read is in flight makes
        // its answer stale, and publishing it would show another index's categories.
        const generation = this.generation ?? 0
        const stillCurrent = () => (this.store.get().url ?? null) === page.url
          && (this.generation ?? 0) === generation
        // The row describes the index, not the current query, so one read per index
        // and process is enough; the cache is keyed by URL and the category set.
        const signature = `${page.url}#${Object.keys(page.metadata?.categories ?? {}).length}`
        const cachedHero = this.heroCache?.get(signature)
        if (cachedHero !== undefined) {
          if (stillCurrent()) this.patch({ hero: cachedHero, heroLoading: false })
          return
        }
        if (!stillCurrent()) return
        // The previous index's cards must not linger under a different index's names.
        if (this.store.get().hero.length > 0 && this.heroSignature !== signature) this.patch({ hero: [], heroLoading: true })
        const categories = page.metadata?.categories ?? {}
        const ids = Object.keys(categories)
        if (ids.length === 0 || this.marketOf() === undefined) {
          this.patch({ hero: [] })
          return
        }
        this.patch({ heroLoading: true })
        // One read per seat, plus a small surplus for the daily rotation: reading the
        // whole list (eleven here) cost several round trips for cards never shown.
        const seats = HERO_COLUMNS * HERO_ROWS
        const limit = Math.min(ids.length, seats + 3)
        const reads = await Promise.all(ids.slice(0, limit).map(async (id) => {
          try {
            const answer = await this.marketOf().search(page.url, {
              labels: [], sort: { kind: 'index' }, offset: 0, limit: HERO_ENTRIES + 1, category: id,
            })
            if (!answer.ok) return null
            return { id, total: answer.value.total, entries: answer.value.entries }
          } catch (error) {
            return null
          }
        }))
        if (this.disposed || !stillCurrent()) return
        if ((this.generation ?? 0) !== generation) return
        const found = reads.filter(item => item !== null && item.total > 0)
        const preferred = HERO_CATEGORIES.filter(id => found.some(item => item.id === id))
        const rest = found
          .filter(item => !preferred.includes(item.id))
          .sort((a, b) => b.total - a.total)
          .map(item => item.id)
        // A full grid: two rows of four on a wide page, never a trailing gap. The
        // page drops a row rather than leave an empty cell when the index is small.
        const wanted = HERO_COLUMNS * HERO_ROWS
        const all = [...preferred, ...rest]
        this.categoryPool = all
        const order = all.length <= wanted ? all : this.seededOrder(all, this.today()).slice(0, wanted)
        void this.refreshNames(found.flatMap(item => item.entries))
        const hero = order.map((id) => {
          const item = found.find(candidate => candidate.id === id)
          return {
            id,
            title: textOf(categories[id]?.title, this.language()) || id,
            total: item.total,
            entries: item.entries.slice(0, HERO_ENTRIES),
          }
        })
        if (this.heroCache === undefined) this.heroCache = new Map()
        this.heroCache.set(signature, hero)
        this.heroSignature = signature
        this.patch({ hero, heroLoading: false })
      }

      /**
       * Show one page of the current query.
       * @param page the 1-based page number.
       */
      async goToPage(page) {
        const state = this.store.get()
        const url = state.url ?? state.indexes.find(index => index.error === undefined)?.url
        if (url === undefined) return
        const offset = Math.max(0, (page - 1) * PAGE_SIZE)
        await this.load(url, state.query, { offset })
      }

      /**
       * Read the installed list once, without opening its view.
       *
       * The tab shows how many plugins are installed, which means the count has to be
       * known before the reader asks for it. This is a local directory read, so it
       * costs no network and does not delay the catalogue.
       */
      primeInstalled() {
        if (this.installedPrimed === true) return
        this.installedPrimed = true
        void this.loadInstalled()
      }

      /**
       * Read the catalogue without showing it.
       *
       * The page opens on the installed list, which needs only local profile data. The
       * market index is the slow part — a public index is two megabytes — so it is read
       * once at mount and left ready; switching tabs then shows a page that already
       * exists instead of starting a download the reader must wait behind.
       */
      warmCatalogue() {
        if (this.catalogueWarmed === true) return
        this.catalogueWarmed = true
        void this.ensure()
      }

      /** Switch between the catalogue and the installed list. */
      setView(view) {
        const next = view === VIEW_INSTALLED ? VIEW_INSTALLED : VIEW_MARKET
        this.patch({ view: next })
        if (next === VIEW_INSTALLED) void this.loadInstalled()
      }

      /**
       * Read the profile's installed bundles.
       *
       * The Host reports every bundle it knows about: installed ones, ones the
       * installation ships, and catalog entries that are not installed. The list
       * shows only what is present, which is what a reader means by "installed".
       */
      async loadInstalled() {
        const manager = this.managerOf()
        if (manager === undefined) {
          this.patchInstalled({ status: 'error', reason: 'unsupported' })
          return
        }
        this.patchInstalled({ status: 'loading', reason: '', failure: '', failureName: '' })
        let answer
        try {
          answer = await manager.listBundles()
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        if (answer === undefined || answer === null || !answer.ok) {
          this.patchInstalled({ status: 'error', reason: messageOf(answer?.error) })
          return
        }
        const all = Array.isArray(answer.value) ? answer.value : []
        const rows = all
          .filter(bundle => bundle.installed === true || bundle.availability === 'installation')
          .map((bundle) => {
            // `installation` means DSH itself ships it; `profile` means it was
            // installed into this profile. The two differ in what can be done to it.
            // Only `availability` answers "does DSH ship this". `official` means
            // "listed in the catalog", which profile-installed bundles are too, so it
            // must never be read as shipped: doing so hid a working enable button
            // behind a "ships with DSH" note.
            const shipped = bundle.availability === 'installation'
            // A bundle the profile installed can always be switched, whatever else the
            // Host says about it; only the Host's own read-only reason blocks it.
            const switchable = bundle.installed === true || shipped
            // A newer version exists only for a third-party registry package: the
            // Host refuses to list versions for official or Git copies.
            const updatable = !shipped
              && bundle.official !== true
              && bundle.installed === true
              && (bundle.update === 'registry' || bundle.update === 'git')
            return {
              name: bundle.name,
              title: textOf(bundle.meta?.title, this.language()) || bundle.name,
              description: textOf(bundle.meta?.description, this.language()),
              version: bundle.version ?? '',
              enabled: bundle.enabled === true,
              shipped,
              switchable,
              origin: shipped ? 'shipped' : 'third-party',
              removable: bundle.removable === true,
              readOnlyReason: bundle.readOnlyReason ?? '',
              update: typeof bundle.update === 'string' ? bundle.update : '',
              updatable,
              error: typeof bundle.error === 'object' && bundle.error !== null
                ? (bundle.error.code ?? '')
                : '',
            }
          })
          .sort((a, b) => a.name.localeCompare(b.name))
        this.patchInstalled({ status: 'ready', rows, reason: '' })
        void this.refreshNames(rows.map(row => ({ name: row.name, title: row.title, description: row.description })))
      }

      /** Merge a change into the installed slice. */
      patchInstalled(part) {
        this.patch({ installed: { ...this.store.get().installed, ...part } })
      }

      /**
       * Enable or disable one installed bundle.
       * @param name the bundle package name.
       * @param enabled the wanted activation state.
       */
      async setInstalledEnabled(name, enabled) {
        const manager = this.managerOf()
        if (manager === undefined) return
        this.patchInstalled({ busy: name, failure: '', failureName: '' })
        let answer
        try {
          answer = await manager.setBundleEnabled(name, enabled)
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        this.patchInstalled({ busy: null })
        if (answer === undefined || answer === null || !answer.ok) {
          this.patchInstalled({ failure: messageOf(answer?.error), failureName: name })
          return
        }
        await this.loadInstalled()
      }

      /** Open one installed plugin's page. */
      openInstalled(name) {
        const row = this.store.get().installed.rows.find(item => item.name === name)
        if (row === undefined) return
        this.patchInstalled({ opened: name, document: { status: 'loading' } })
        void this.loadInstalledDocument(row)
      }

      /** Close the plugin page and return to the installed list. */
      closeInstalled() {
        this.patchInstalled({ opened: null, document: null })
      }

      /**
       * Read an installed bundle's own document.
       *
       * The Host reads it from the installed directory with no network access, so a
       * plugin page works offline; `none` means the package ships neither a detail
       * document nor a README.
       */
      async loadInstalledDocument(row) {
        const manager = this.managerOf()
        if (manager === undefined) {
          this.patchInstalled({ document: { status: 'error', reason: 'unsupported' } })
          return
        }
        let answer
        try {
          answer = await manager.readBundleDetail(row.name, this.language(), {})
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        if (answer === undefined || answer === null || !answer.ok) {
          this.patchInstalled({ document: { status: 'error', reason: messageOf(answer?.error) } })
          return
        }
        const detail = answer.value
        if (detail === null || typeof detail !== 'object' || detail.status !== 'found') {
          this.patchInstalled({ document: { status: 'none' } })
          return
        }
        this.patchInstalled({ document: { status: 'ready', markdown: detail.markdown ?? '' } })
      }

      /** Re-read the open plugin's document after a failed read. */
      retryInstalledDocument() {
        const name = this.store.get().installed.opened
        if (name === null) return
        const row = this.store.get().installed.rows.find(item => item.name === name)
        if (row === undefined) return
        this.patchInstalled({ document: { status: 'loading' } })
        void this.loadInstalledDocument(row)
      }

      /**
       * Pull another configured index into the Host's cache while the reader looks at
       * the current one.
       *
       * The Host caches a fetched document for ten minutes, so this turns a later
       * source switch from a network wait into a memory read. It asks for one entry,
       * which is enough to make the Host fetch and cache the whole document.
       */
      warmIndex(url) {
        if (this.warmed?.has(url) === true || url === this.store.get().url) return
        if (this.warmed === undefined) this.warmed = new Set()
        this.warmed.add(url)
        const market = this.marketOf()
        if (market === undefined) return
        void market.search(url, {
          labels: [], sort: { kind: 'index' }, offset: 0, limit: 1,
        }).catch(() => {
          // A warm-up is best effort: a failure must not surface anywhere.
          this.warmed?.delete(url)
        })
      }

      /**
       * Ask the registries which installed plugins have a newer version.
       *
       * Only third-party registry packages are asked: the Host refuses a version list
       * for a bundle DSH ships or one installed from Git. The calls run a few at a
       * time, because each one is a network round trip per registry.
       */
      async checkUpdates() {
        const manager = this.managerOf()
        if (manager === undefined) return
        const rows = this.store.get().installed.rows.filter(row => row.updatable === true)
        this.patchInstalled({ checking: true, checked: true, checkReason: '' })
        if (rows.length === 0) {
          this.patchInstalled({ checking: false, updates: {} })
          return
        }
        const updates = {}
        let lastReason = ''
        // Four in flight: enough to feel quick, small enough not to hammer a registry.
        const queue = [...rows]
        const worker = async () => {
          while (queue.length > 0 && !this.disposed) {
            const row = queue.shift()
            let answer
            try {
              answer = await manager.listVersions(row.name, {})
            } catch (error) {
              answer = { ok: false, error }
            }
            if (answer === undefined || answer === null || !answer.ok) {
              lastReason = messageOf(answer?.error)
              continue
            }
            const list = answer.value
            if (list === null || typeof list !== 'object' || list.status !== 'listed') {
              // A refusal is expected for some packages ("Git lists no versions",
              // "no semver"), and is not a failure of the check as a whole.
              if (typeof list?.reason === 'string' && lastReason === '') lastReason = list.reason
              continue
            }
            const newest = Array.isArray(list.versions) && list.versions.length > 0
              ? list.versions[0]
              : undefined
            if (newest === undefined) continue
            // A version that cannot run on this DSH is not an update the reader can use.
            if (newest.compatibility?.compatible === false && newest.compatibility?.exempted !== true) continue
            updates[row.name] = {
              version: newest.version,
              kind: row.update === 'git' ? 'git' : 'registry',
              spec: newest.install?.spec ?? '',
            }
          }
        }
        await Promise.all([worker(), worker(), worker(), worker()])
        if (this.disposed) return
        this.patchInstalled({ checking: false, updates, checkReason: lastReason })
      }

      /**
       * Update one installed plugin to a newer version.
       * @param name the bundle package name.
       * @param target the published version to install.
       * @returns whether it was applied and, on failure, why.
       */
      async updateOne(name, target) {
        const manager = this.managerOf()
        if (manager === undefined) return { ok: false, reason: 'unsupported' }
        const row = this.store.get().installed.rows.find(item => item.name === name)
        const requestId = (globalThis.crypto?.randomUUID?.() ?? `dem-up-${Date.now()}`)
        this.patchInstalled({ busy: name, failure: '', failureName: '' })
        let answer
        try {
          answer = await manager.updateBundle(name, target.version, {
            requestId,
            ...target.kind === 'git' && target.spec !== '' ? { spec: target.spec } : {},
          })
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return { ok: false, reason: 'disposed' }
        this.patchInstalled({ busy: null })
        if (answer === undefined || answer === null || !answer.ok) {
          const reason = messageOf(answer?.error)
          this.patchInstalled({ failure: reason, failureName: name })
          return { ok: false, reason }
        }
        const outcome = answer.value?.result
        if (outcome !== undefined && outcome !== null && outcome.application === 'failed') {
          const reason = messageOf(outcome.error)
          this.patchInstalled({ failure: reason, failureName: name })
          return { ok: false, reason }
        }
        // The plugin is new now, so its row and its version list both change.
        const updates = { ...this.store.get().installed.updates }
        delete updates[name]
        this.patchInstalled({ updates })
        if (row === undefined || row.removable !== false) await this.loadInstalled()
        return { ok: true }
      }

      /**
       * Update every plugin that has a newer version, one at a time.
       *
       * Serial by necessity: each update rewrites the profile manifest and its
       * lockfile, so running two at once would have them overwrite each other. A
       * failure is recorded and the batch continues.
       */
      async updateAll() {
        const pending = Object.entries(this.store.get().installed.updates)
        if (pending.length === 0) return
        this.patchInstalled({
          batch: { total: pending.length, done: 0, current: '', succeeded: 0, failed: [] },
        })
        for (const [name, target] of pending) {
          if (this.disposed) break
          this.patchInstalled({ batch: { ...this.store.get().installed.batch, current: name } })
          const result = await this.updateOne(name, target)
          const batch = this.store.get().installed.batch
          if (batch === null) break
          this.patchInstalled({
            batch: {
              ...batch,
              done: batch.done + 1,
              succeeded: batch.succeeded + (result.ok ? 1 : 0),
              failed: result.ok ? batch.failed : [...batch.failed, { name, reason: result.reason }],
              current: '',
            },
          })
        }
        await this.loadInstalled()
        // Keep the summary visible; the caller dismisses it.
        const finished = this.store.get().installed.batch
        this.patchInstalled({ batch: finished === null ? null : { ...finished, current: '', finished: true } })
      }

      /** Dismiss the batch summary without touching the rows. */
      dismissBatch() {
        this.patchInstalled({ batch: null })
      }

      /**
       * Remove one installed bundle from the profile.
       * @param name the bundle package name.
       */
      async removeInstalled(name) {
        const manager = this.managerOf()
        if (manager === undefined) return
        this.patchInstalled({ busy: name, failure: '', failureName: '' })
        let answer
        try {
          answer = await manager.removeBundle(name)
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        this.patchInstalled({ busy: null })
        if (answer === undefined || answer === null || !answer.ok) {
          this.patchInstalled({ failure: messageOf(answer?.error), failureName: name })
          return
        }
        await this.loadInstalled()
      }

      /** Narrow the page already on screen; no index read is needed. */
      setFilter(next) {
        this.patch({ filter: { ...this.store.get().filter, ...next } })
      }

      /** Switch the query, re-reading from the first page. */
      search(next) {
        const state = this.store.get()
        const url = state.url ?? state.indexes.find(index => index.error === undefined)?.url
        if (url === undefined) return
        if (this.timer !== null) { clearTimeout(this.timer); this.timer = null }
        this.patch({ query: next })
        if (next.text !== state.query.text) {
          this.timer = setTimeout(() => {
            this.timer = null
            if (!this.disposed) void this.load(url, next)
          }, TEXT_DELAY_MS)
          return
        }
        void this.load(url, next)
      }

      /**
       * The entries whose Chinese name matches a query.
       *
       * The Host searches the index's own fields — package name, original title,
       * keywords — so a Chinese name this plugin invented is invisible to it. The
       * stored names are searched here instead, and the answer is merged into the
       * grid so one box answers both vocabularies.
       *
       * @param text the query as typed.
       * @returns the package names whose given Chinese name contains the text.
       */
      chineseMatches(text) {
        const needle = String(text ?? '').trim().toLowerCase()
        if (needle === '') return []
        const names = this.store.get().names
        const matched = []
        for (const [name, given] of Object.entries(names)) {
          if (typeof given !== 'string' || given === '') continue
          // A Latin query is not a Chinese name, so it is left to the Host.
          if (!/[\u4e00-\u9fff]/.test(needle)) continue
          if (given.toLowerCase().includes(needle)) matched.push(name)
        }
        return matched
      }

      /**
       * Turn the host's page into the grid this query should show.
       *
       * A Chinese query is handled by reading the whole index once and filtering
       * locally, because the Host cannot see the names this plugin invented. An
       * earlier page that already filtered by text is replaced, so the two
       * vocabularies never stack into an empty result.
       *
       * @param entries the host's entries for the current page.
       * @param query the query those entries answer.
       * @returns the entries to render.
       */
      localChinesePage(entries, query) {
        const text = String(query?.text ?? '').trim()
        if (text === '') return null
        if (!/[\u4e00-\u9fff]/.test(text)) return null
        const matched = new Set(this.chineseMatches(text))
        if (matched.size === 0) return null
        // The caller holds the index's full listing on the first page; filter it.
        const all = this.fullListing?.entries
        if (!Array.isArray(all)) return null
        const byName = new Map(all.map(entry => [entry.name, entry]))
        const picked = []
        for (const name of matched) {
          const entry = byName.get(name)
          if (entry !== undefined) picked.push(entry)
        }
        return picked.length === 0 ? null : picked
      }

      /** Re-read the current page after an external change. */
      reload() {
        const state = this.store.get()
        if (state.url === null) {
          this.started = false
          void this.ensure()
          return
        }
        void this.load(state.url, state.query, { refresh: true })
      }

      /**
       * Add one index source.
       *
       * The source list belongs to the profile, so the Host writes it through the
       * same Settings path the Plugins page uses; the committed list arrives back
       * through `plugin-market/changed`.
       */
      async addIndex(url) {
        const value = String(url ?? '').trim()
        if (value === '' || this.marketOf() === undefined) return { ok: false, reason: 'empty' }
        const urls = [...this.store.get().indexes.map(index => index.url), value]
        try {
          const answer = await this.marketOf().setIndexes(urls)
          if (!answer.ok) return { ok: false, reason: messageOf(answer.error) }
          this.started = false
          await this.ensure()
          return { ok: true }
        } catch (error) {
          return { ok: false, reason: messageOf(error) }
        }
      }

      /** Remove one index source; its stored names are left alone. */
      async removeIndex(url) {
        if (this.marketOf() === undefined) return { ok: false }
        const urls = this.store.get().indexes.map(index => index.url).filter(candidate => candidate !== url)
        try {
          const answer = await this.marketOf().setIndexes(urls)
          if (!answer.ok) return { ok: false, reason: messageOf(answer.error) }
          this.started = false
          await this.ensure()
          return { ok: true }
        } catch (error) {
          return { ok: false, reason: messageOf(error) }
        }
      }

      /** Switch the index source. */
      /**
       * Read another index from its first page.
       *
       * The query and the page reset, and the filters go back to "any": a category id
       * or a label means something else in another index, so carrying them over would
       * show an empty list for no visible reason.
       */
      selectIndex(url) {
        this.generation = (this.generation ?? 0) + 1
        this.patch({ filter: { ...INITIAL_FILTER } })
        void this.load(url, INITIAL_QUERY, { refresh: true })
      }

      /** Read one page of an entry's long description, once per language. */
      async loadDetail(request) {
        const key = JSON.stringify([request.language, request.url, request.name, request.version])
        const state = this.store.get()
        const previous = state.detail[key]?.status
        if (previous === 'loading') return
        if (previous === 'ready' && request.refresh !== true) return
        if (this.marketOf() === undefined) return
        this.patch({ detail: { ...state.detail, [key]: { status: 'loading' } } })
        let answer
        try {
          answer = await this.marketOf().readEntryDetail(request.url, request.name, request.version, request.language,
            request.refresh === true ? { refresh: true } : {})
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        const current = this.store.get().detail
        this.patch({
          detail: {
            ...current,
            [key]: answer.ok
              ? { status: 'ready', detail: answer.value }
              : { status: 'error', message: answer.error?.message ?? '' },
          },
        })
      }

      /** Address of a relative image inside a detail document, served beside the document. */
      detailImage(document, path) {
        const base = `/api/plugin-market/detail-file?origin=${encodeURIComponent(document.origin ?? '')}&document=${encodeURIComponent(document.document ?? '')}`
        return `${base}&path=${encodeURIComponent(path)}`
      }

      /**
       * Open the install dialog on its confirmation step. Nothing is installed
       * until the reader confirms, so a click on a card cannot start a third-party
       * package on its own.
       */
      prepareInstall(entry, version) {
        const spec = version?.install?.spec ?? `${entry.name}@${entry?.version ?? ''}`
        const registry = version?.install?.registry
        this.patch({
          install: {
            ...EMPTY_INSTALL, open: true, phase: 'confirm', entry, version,
            title: this.nameOf(entry, this.language()),
            spec, registry: registry ?? null,
          },
        })
      }

      /** Start the confirmed install and follow its progress. */
      async runInstall(approvedBuilds) {
        if (this.managerOf() === undefined) return
        const prepared = this.store.get().install
        if (prepared.entry === null || prepared.version === null) return
        const { entry, version, spec, registry } = prepared
        const requestId = (globalThis.crypto?.randomUUID?.() ?? `dem-${Date.now()}-${Math.random().toString(16).slice(2)}`)
        this.patchInstall({ phase: 'starting', requestId, failure: null, runs: [], log: '', pendingBuilds: [], cancelling: false })
        let answer
        try {
          answer = await this.managerOf().installBundle(spec, {
            enabled: true,
            requestId,
            ...registry === undefined ? {} : { registry },
            ...approvedBuilds === undefined ? {} : { approvedBuilds },
          })
        } catch (error) {
          answer = { ok: false, error }
        }
        if (this.disposed) return
        if (!answer.ok) {
          this.patchInstall({ phase: 'failed', failure: messageOf(answer.error) })
          return
        }
        this.settle(answer.value)
      }

      /** Fold one install result into the dialog state. */
      settle(value) {
        const application = value?.application
        if (application === 'cancelled') {
          this.patchInstall({ phase: 'cancelled' })
        } else if (application === 'failed') {
          this.patchInstall({
            phase: 'failed',
            failure: value.error?.message ?? value.error?.code ?? '',
            pendingBuilds: Array.isArray(value.pendingBuilds) ? value.pendingBuilds : [],
          })
        } else {
          this.patchInstall({
            phase: 'done',
            result: value,
            installedVersion: value.version ?? null,
            restartRequired: application === 'restart-required',
          })
          this.reload()
        }
      }

      patchInstall(part) {
        const install = this.store.get().install
        this.patch({ install: { ...install, ...part } })
      }

      /** Follow one installation event frame. */
      installState(frame) {
        const install = this.store.get().install
        if (frame?.requestId === undefined || frame.requestId !== install.requestId) return
        const phase = frame.phase === 'applying' ? 'applying' : frame.phase === 'cancelling' ? 'cancelling' : frame.phase === 'installing' ? 'installing' : install.phase
        this.patchInstall({ phase })
      }

      /** Append one install log chunk. */
      appendLog(chunk) {
        const install = this.store.get().install
        if (chunk?.requestId === undefined || chunk.requestId !== install.requestId) return
        const runs = [...install.runs]
        const index = runs.findIndex(run => run.jobId === chunk.jobId)
        const line = { jobId: chunk.jobId, text: chunk.text ?? '', exitCode: chunk.exitCode }
        if (index === -1) runs.push(line)
        else runs[index] = { ...runs[index], text: `${runs[index].text}${line.text}`, exitCode: line.exitCode ?? runs[index].exitCode }
        const tail = runs.map(run => run.text).join('').split('\n').slice(-60).join('\n')
        this.patchInstall({ runs, log: tail })
      }

      /** Ask the Host to stop an installation. */
      async cancelInstall() {
        const install = this.store.get().install
        if (install.requestId === null || this.managerOf() === undefined) return
        this.patchInstall({ cancelling: true, phase: 'cancelling' })
        try {
          const answer = await this.managerOf().cancelInstall(install.requestId)
          if (this.disposed) return
          if (answer.ok && answer.value.status === 'too-late') {
            this.patchInstall({ cancelling: false, phase: 'applying', note: 'too-late' })
            return
          }
          if (answer.ok && answer.value.status === 'cancelled') this.patchInstall({ phase: 'cancelled', cancelling: false })
          else this.patchInstall({ cancelling: false })
        } catch (error) {
          if (!this.disposed) this.patchInstall({ cancelling: false })
        }
      }

      /** Close the install dialog unless an install is still running. */
      closeInstall() {
        const install = this.store.get().install
        if (install.phase === 'starting' || install.phase === 'installing' || install.phase === 'applying' || install.phase === 'cancelling') return
        this.patch({ install: EMPTY_INSTALL })
      }

      /** Remove every timer and subscription this controller owns. */
      dispose() {
        this.disposed = true
        if (this.timer !== null) { clearTimeout(this.timer); this.timer = null }
      }
    }
