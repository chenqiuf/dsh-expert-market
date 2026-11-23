/**
 * Expert market page, browser half.
 *
 * Reads the configured plugin market indexes through the application's
 * `pluginMarket` Remote and installs through `pluginManager`, then draws them the
 * way the WorkBuddy expert directory reads: five situation cards, a sortable
 * card grid, and one full page per plugin. Nothing here imports a Harness Client
 * package; the controls, covers, and Markdown view are this file's own.
 */
window.__ModuleLoader__.load({
  id: 'dsh-expert-market',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React

    /** Locale namespace of this page. */
    const NS = 'expertMarket'
    /** Main-panel key and sidebar entry id; one value so the panel and its icon stay paired. */
    const PANEL_ID = 'expert-market'
    /** How many entries one Chinese-name search reads at once: enough to cover an
     *  index this size without paging, and bounded so a huge index cannot stall. */
    const LOCAL_SEARCH_LIMIT = 2000

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
      tabMarket: '逛插件',
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
      search: '搜索插件、作者或关键词',
      searchLabel: '搜索插件',
      searchBoth: '同时支持中文名和原插件名搜索',
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
      tabMarket: 'Browse',
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
      search: 'Search plugins, authors, or keywords',
      searchLabel: 'Search plugins',
      searchBoth: 'Searches Chinese names and original plugin names',
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
      view: VIEW_MARKET,
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
          limit: chineseQuery ? LOCAL_SEARCH_LIMIT : PAGE_SIZE,
          ...query.category === null ? {} : { category: query.category },
        }
        let answer
        try {
          answer = await this.marketOf().search(url, request)
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
            const shipped = bundle.availability === 'installation'
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

    // ---------------------------------------------------------------- icons

    /** One 20px stroke glyph. */
    function glyph(paths, options) {
      return h('svg', {
        viewBox: '0 0 20 20', width: options?.size ?? 16, height: options?.size ?? 16, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, className: options?.className,
      }, ...paths.map((path, index) => h('path', { key: index, d: path })))
    }

    const IconSearch = () => glyph(['M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z', 'M13.2 13.2 16.5 16.5'])
    const IconChevronDown = (p) => glyph(['M5.5 8 10 12.5 14.5 8'], p)
    const IconChevronRight = (p) => glyph(['M8 5.5 12 10 8 14.5'], p)
    const IconRefresh = () => glyph(['M16 10a6 6 0 1 1-1.8-4.3', 'M16 3.6V7h-3.4'])
    const IconPlus = () => glyph(['M10 4.4v11.2', 'M4.4 10h11.2'])
    const IconClose = () => glyph(['M5.5 5.5 14.5 14.5', 'M14.5 5.5 5.5 14.5'])
    /** A tick: the current source in a menu, where colour alone is easy to miss. */
    const IconCheck = (p) => glyph(['M4.5 10.5 7.8 13.8 15.5 6.2'], p)
    const IconStar = (p) => h('svg', {
      viewBox: '0 0 20 20', width: p?.size ?? 13, height: p?.size ?? 13, 'aria-hidden': true,
      className: p?.className,
    }, h('path', {
      d: 'M10 2.6l2.2 4.5 4.9.7-3.6 3.5.9 4.9-4.4-2.4-4.4 2.4.9-4.9L2.9 7.8l4.9-.7z',
    }))
    const IconDownload = (p) => glyph(['M10 3v9', 'M6.2 8.6 10 12.4l3.8-3.8', 'M4 16h12'], p)
    const IconSpark = (p) => h('svg', {
      viewBox: '0 0 20 20', width: p?.size ?? 16, height: p?.size ?? 16, 'aria-hidden': true,
      className: p?.className,
    }, h('path', { d: 'M10 2.2l1.5 4.1 4.1 1.5-4.1 1.5L10 13.4l-1.5-4.1L4.4 7.8l4.1-1.5z' }))

    // ---------------------------------------------------------------- covers

    // ---------------------------------------------------------------- atoms

    /** An entry's artwork, falling back to an initial plate when the image fails. */
    /**
     * An entry's artwork. A published icon is shown as-is; without one the card
     * gets a designed monogram — the first character of the plugin's Chinese name
     * on a deterministic tint — instead of a bare initial or blank tile.
     */
    /**
     * An entry's artwork. A published icon is shown as-is; without one the card
     * gets its category's own icon on a tinted plate, matching the pictogram
     * treatment the host uses for its built-in plugins.
     */
    function MarketIcon({ entry, size, className, onClick }) {
      const [failed, setFailed] = useState(false)
      const category = entry.metadata?.category ?? ''
      const Glyph = CATEGORY_GLYPH[category] ?? CATEGORY_GLYPH.fallback
      const tone = CATEGORY_TONE[category] ?? CATEGORY_TONE.fallback
      const buttonlike = onClick !== undefined ? 'dem-iconButtonlike' : undefined
      if (entry.icon !== undefined && !failed) {
        return h('img', {
          className: cls('dem-icon', className, buttonlike),
          src: entry.icon, width: size, height: size, alt: '', 'aria-hidden': true,
          loading: 'eager', decoding: 'async', referrerPolicy: 'no-referrer', onClick,
          style: { width: `${size}px`, height: `${size}px` },
          onError: () => { setFailed(true) },
        })
      }
      return h('span', {
        className: cls('dem-mark', className, buttonlike),
        'aria-hidden': true, onClick,
        style: {
          width: `${size}px`, height: `${size}px`,
          '--dem-mark-tone': tone,
        },
      }, h(Glyph, { size: Math.round(size * 0.52) }))
    }

    /**
     * One category's pictogram.
     *
     * The marks are line drawings: the category's shape keeps a crisp stroke, and a
     * second path adds a quieter tone, so an icon reads at 32px without a filled
     * plate behind it. `cut` paths exist only for the solid variant and are not
     * drawn here.
     */
    function categoryGlyph(shape, accent) {
      return function CategoryGlyph({ size }) {
        const children = shape.map((d, index) => h('path', {
          key: `s-${index}`, d, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
          strokeLinecap: 'round', strokeLinejoin: 'round',
        }))
        for (const [index, d] of (accent ?? []).entries()) {
          children.push(h('path', {
            key: `a-${index}`, d, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
            strokeLinecap: 'round', strokeLinejoin: 'round', opacity: 0.62,
          }))
        }
        return h('svg', {
          viewBox: '0 0 24 24', width: size, height: size,
          'aria-hidden': true, style: { display: 'block' },
        }, ...children)
      }
    }

    /** Category id → its pictogram: a solid body, a second tone, and cut-outs. */
    const CATEGORY_GLYPH = {
      // interface: two overlapping panels, the way the layout seat reads.
      interface: categoryGlyph(
        ['M3.4 6.2A2.4 2.4 0 0 1 5.8 3.8h7.4a2.4 2.4 0 0 1 2.4 2.4v7.4a2.4 2.4 0 0 1-2.4 2.4H5.8a2.4 2.4 0 0 1-2.4-2.4z'],
        ['M8.4 10.4a2.4 2.4 0 0 1 2.4-2.4h7.4a2.4 2.4 0 0 1 2.4 2.4v7.4a2.4 2.4 0 0 1-2.4 2.4h-7.4a2.4 2.4 0 0 1-2.4-2.4z'],
        ['M13 11.4h5.2v5.2H13z'],
      ),
      // appearance: a paint droplet with a highlight.
      appearance: categoryGlyph(
        ['M12 2.8c3.4 4.3 5.6 7.2 5.6 9.7a5.6 5.6 0 0 1-11.2 0c0-2.5 2.2-5.4 5.6-9.7z'],
        ['M12 6.4c1.9 2.5 3.1 4.2 3.1 5.6a3.1 3.1 0 0 1-6.2 0c0-1.4 1.2-3.1 3.1-5.6z'],
        ['M9.8 12.2a2.6 2.6 0 0 1 2.2-2.4v4.8a2.6 2.6 0 0 1-2.2-2.4z'],
      ),
      // tools: a solid wrench.
      tools: categoryGlyph(
        ['M15.8 3.4a5 5 0 0 0 3.9 8l-9.3 9.3a2.3 2.3 0 0 1-3.3-3.3l9.3-9.3a5 5 0 0 0-.6-4.7z'],
        ['M4.9 18.2a2.3 2.3 0 0 1 3.3 0 2.3 2.3 0 0 1-3.3 0z'],
        undefined,
      ),
      // skills: a four-point spark with a small second spark.
      skills: categoryGlyph(
        ['M10.6 2.6l2.1 4.9 4.9 2.1-4.9 2.1-2.1 4.9-2.1-4.9L3.6 9.6l4.9-2.1z'],
        ['M17.8 13.6l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z'],
        undefined,
      ),
      // memory: three stacked layers.
      memory: categoryGlyph(
        ['M12 2.9l8.8 4.4-8.8 4.4-8.8-4.4z'],
        ['M3.2 12.2l8.8 4.4 8.8-4.4-1.9-.9-6.9 3.5-6.9-3.5z', 'M3.2 16.1l8.8 4.4 8.8-4.4-1.9-.9-6.9 3.5-6.9-3.5z'],
        undefined,
      ),
      // providers: a plug with solid pins.
      providers: categoryGlyph(
        ['M6.2 7.4h11.6v4.6a5.8 5.8 0 0 1-11.6 0z', 'M10.4 17.6h3.2v2.6h-3.2z'],
        ['M9 2.8h1.8v4.2H9zM13.2 2.8h1.8v4.2h-1.8z'],
        undefined,
      ),
      // usage: solid ascending bars.
      usage: categoryGlyph(
        ['M4 20.4h2.8v-7.2H4zM10.6 20.4h2.8V8.6h-2.8zM17.2 20.4h2.8V3.8h-2.8z'],
        undefined,
        undefined,
      ),
      // workflow: two solid nodes and a connector.
      workflow: categoryGlyph(
        ['M5.2 3.6h4.6v4.6H5.2zM14.2 15.8h4.6v4.6h-4.6z'],
        ['M7.5 8.2h1.9v3.2a2.4 2.4 0 0 1-2.4 2.4H7.5zM9.4 12.2h4.8v1.9H9.4z'],
        undefined,
      ),
      // integrations: two solid tiles linked by a bar.
      integrations: categoryGlyph(
        ['M3.6 3.6h7v7h-7zM13.4 13.4h7v7h-7z'],
        ['M10.6 6.4h2.6a2.4 2.4 0 0 1 2.4 2.4v2.6h-2.4V8.8h-2.6z'],
        undefined,
      ),
      // knowledge: an open book.
      knowledge: categoryGlyph(
        ['M11.2 5.9C9.4 4.5 7 3.8 3.8 3.8v13.4c3.2 0 5.6.7 7.4 2.1zM12.8 5.9c1.8-1.4 4.2-2.1 7.4-2.1v13.4c-3.2 0-5.6.7-7.4 2.1z'],
        ['M5.6 6.6h4.2v1.6H5.6zM5.6 9.4h4.2V11H5.6zM14.2 6.6h4.2v1.6h-4.2z'],
        undefined,
      ),
      // development: solid angle brackets.
      development: categoryGlyph(
        ['M8.6 6.2L2.4 12l6.2 5.8 1.7-1.8L6 12l4.3-4zM15.4 6.2L21.6 12l-6.2 5.8-1.7-1.8L18 12l-4.3-4z'],
        ['M12.9 4.2h1.9l-1.7 15.6h-1.9z'],
        undefined,
      ),
      // theme: a paint palette.
      theme: categoryGlyph(
        ['M12 3.2a8.8 8.8 0 1 0 0 17.6c1.8 0 2.6-1 2.6-2.2 0-1.6-1.4-1.8-1.4-3.1 0-1 .9-1.7 2-1.7h1.6a3.8 3.8 0 0 0 3.8-3.8c0-3.9-3.8-6.8-8.6-6.8z'],
        ['M8.2 10.4a1.5 1.5 0 1 0 0-.02zM10.8 7.2a1.5 1.5 0 1 0 0-.02zM14.6 7.2a1.5 1.5 0 1 0 0-.02z'],
        undefined,
      ),
      model: categoryGlyph(
        ['M12 2.8l7.8 4.5v9.4L12 21.2 4.2 16.7V7.3z'],
        ['M12 8.4l4.2 2.4v4.8L12 18l-4.2-2.4v-4.8z'],
        undefined,
      ),
      ui: categoryGlyph(
        ['M3.4 5.2h17.2v13.6H3.4z'],
        ['M3.4 8.8h17.2v2.2H3.4z', 'M6.4 11.8h11.2v5.4H6.4z'],
        ['M6.4 13.4h5v1.6h-5zM6.4 15.8h7.4v1.6H6.4z'],
      ),
      session: categoryGlyph(
        ['M20.6 11.8c0 4-3.8 7.2-8.6 7.2-1 0-2-.1-2.9-.4l-4.7 1.7 1.5-3.7a6.7 6.7 0 0 1-2.5-4.8c0-4 3.8-7.2 8.6-7.2s8.6 3.2 8.6 7.2z'],
        ['M8.2 10.2h7.6v1.7H8.2zM8.2 13.2h5.2v1.7H8.2z'],
        undefined,
      ),
      skill: categoryGlyph(
        ['M11 2.6l2.3 5.3 5.3 2.3-5.3 2.3-2.3 5.3-2.3-5.3L3.4 10.2l5.3-2.3z'],
        ['M18 13.8l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z'],
        undefined,
      ),
      // dev: a runtime terminal window, distinct from the code brackets.
      dev: categoryGlyph(
        ['M3.4 5.2h17.2a1.6 1.6 0 0 1 1.6 1.6v10.4a1.6 1.6 0 0 1-1.6 1.6H3.4a1.6 1.6 0 0 1-1.6-1.6V6.8a1.6 1.6 0 0 1 1.6-1.6z'],
        ['M4.4 8.4h3.2M9.6 8.4h3.2M4.4 11.6l2.6 2.2-2.6 2.2M9 16.2h5.6'],
      ),
      // identity: a person in a circle, distinct from the globe.
      identity: categoryGlyph(
        ['M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4z'],
        ['M12 7.6a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM6.6 18.6c.9-2.6 2.9-4 5.4-4s4.5 1.4 5.4 4'],
      ),
      // browser: a globe with two meridians and a pupil, kept clearly round.
      browser: categoryGlyph(
        ['M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4z', 'M2.8 12h18.4'],
        ['M12 2.8c2.8 2.6 4.2 5.7 4.2 9.2S14.8 18.6 12 21.2c-2.8-2.6-4.2-5.7-4.2-9.2S9.2 5.4 12 2.8z'],
      ),

      docs: categoryGlyph(
        ['M5.8 2.8h8.2L19 7.8v13.4H5.8z'],
        ['M14 2.8v5h5z'],
        ['M8.6 11.4h7.2v1.6H8.6zM8.6 14.4h5.4v1.6H8.6zM8.6 17.4h6.2v1.6H8.6z'],
      ),
      vision: categoryGlyph(
        ['M1.8 12S5.6 5.8 12 5.8 22.2 12 22.2 12 18.4 18.2 12 18.2 1.8 12 1.8 12z'],
        ['M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z'],
        ['M12 10.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z'],
      ),
      voice: categoryGlyph(
        ['M3.4 10.4h1.6v3.2H3.4zM7 7.6h1.6v8.8H7zM10.6 4.4h1.6v15.2h-1.6zM14.2 7.6h1.6v8.8h-1.6zM17.8 10.4H19v3.2h-1.2z'],
        ['M18.6 10.4h1.8v3.2h-1.8z'],
        undefined,
      ),
      notify: categoryGlyph(
        ['M18.6 15.8H5.4l1.8-2.6V9.4a4.8 4.8 0 0 1 9.6 0v3.8z'],
        ['M10 18.6a2.4 2.4 0 0 0 4 0z'],
        ['M10.8 8.4h2.4v4h-2.4z'],
      ),
      security: categoryGlyph(
        ['M12 2.8l7.6 3v5.8c0 4.8-3.2 8.4-7.6 9.6-4.4-1.2-7.6-4.8-7.6-9.6V5.8z'],
        ['M8.6 12.2l2.4 2.4 4.6-4.8 1.6 1.6-6.2 6.4-4-4z'],
        undefined,
      ),
      remote: categoryGlyph(
        ['M3 17.4h18v2.2H3z'],
        ['M6 8.2h12a2.4 2.4 0 0 1 2.4 2.4v6H3.6v-6A2.4 2.4 0 0 1 6 8.2z'],
        ['M8.2 11h7.6v1.8H8.2z'],
      ),
      market: categoryGlyph(
        ['M4.2 8.6h15.6l-1.4 11.4H5.6z'],
        ['M8.4 8.6V7a3.6 3.6 0 0 1 7.2 0v1.6h-2.2V7a1.4 1.4 0 0 0-2.8 0v1.6z'],
        ['M9.4 11.6h5.2v1.8H9.4z'],
      ),

      agi: categoryGlyph(
        ['M12 2.6l2.6 6 6 2.6-6 2.6-2.6 6-2.6-6-6-2.6 6-2.6z'],
        ['M19.2 3.4l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z'],
        undefined,
      ),
      git: categoryGlyph(
        ['M11 3.2h2v8.4h-2z', 'M11.4 7.2h6.2v1.8h-6.2z'],
        ['M5 10.6a3 3 0 1 1 0 .02zM6 13.6a3 3 0 1 0 0 .02zM17 8.2a2.6 2.6 0 1 0 0 .02z'],
        undefined,
      ),
      fun: categoryGlyph(
        ['M12 2.6l2.8 5.9 6.4.8-4.7 4.5 1.2 6.4L12 17.2l-5.7 3 1.2-6.4-4.7-4.5 6.4-.8z'],
        undefined,
        undefined,
      ),
      wsl: categoryGlyph(
        ['M3.2 5.4l8 3.9v9.8l-8-3.9zM20.8 5.4l-8 3.9v9.8l8-3.9z'],
        ['M9.8 11.2h4.4v1.8H9.8z'],
        undefined,
      ),
      fallback: categoryGlyph(
        ['M4.2 5.2h15.6a1.4 1.4 0 0 1 1.4 1.4v10.8a1.4 1.4 0 0 1-1.4 1.4H4.2a1.4 1.4 0 0 1-1.4-1.4V6.6a1.4 1.4 0 0 1 1.4-1.4z'],
        ['M2.8 9.4h18.4v2.2H2.8z'],
        ['M9.4 14h5.2v1.8H9.4z'],
      ),
    }

    /** Category id → the plate hue it paints. */
    const CATEGORY_TONE = {
      interface: 'hsl(214 78% 58%)',
      appearance: 'hsl(300 58% 62%)',
      tools: 'hsl(166 52% 46%)',
      skills: 'hsl(38 88% 56%)',
      memory: 'hsl(255 68% 66%)',
      providers: 'hsl(206 72% 54%)',
      usage: 'hsl(190 70% 48%)',
      workflow: 'hsl(24 78% 56%)',
      integrations: 'hsl(280 60% 62%)',
      knowledge: 'hsl(96 44% 46%)',
      development: 'hsl(222 66% 60%)',
      fallback: 'hsl(210 30% 56%)',
    }

    /** A pill-shaped toggle used by categories and sorting. */
    function Pill({ active, children, onClick, pressed }) {
      return h('button', {
        type: 'button', className: cls('dem-pill', active && 'dem-pillActive'),
        'aria-pressed': pressed ?? active, onClick,
      }, children)
    }

    /** The small stat line at a card's foot. */
    function Stat({ icon, children, title }) {
      if (children === undefined || children === null || children === '') return null
      return h('span', { className: 'dem-stat', title }, icon, h('span', null, children))
    }

    // ---------------------------------------------------------------- hero

    /**
     * One category cover: the single mark for that category, scaled for a 44px tile.
     *
     * At this size only the silhouette survives, so the plate stays a faint tint and
     * the mark is drawn large and solid. Each category keeps its own shape and colour,
     * which is what tells six neighbouring cards apart.
     */
    /**
     * One category cover: a dark, glowing tech illustration.
     *
     * The composition follows the reference art: a deep vignette, the category's mark
     * as a lit subject sitting right of centre, thin orbit arcs crossing behind it,
     * and a scatter of particles that fades toward the frame. The mark comes from the
     * same 31 shapes the small icons use, so each category keeps one identity in both
     * sizes; only the atmosphere is shared.
     */
    function Cover({ id, label }) {
      const tone = COVER_PALETTE[id] ?? COVER_PALETTE.fallback
      const mark = COVER_MARKS[id] ?? COVER_MARKS.fallback
      const uid = `dem-${id}`
      // A deterministic scatter per category: the same cover every render, but no two
      // categories share a particle field.
      let seed = 0
      for (let at = 0; at < id.length; at += 1) seed = (seed * 31 + id.charCodeAt(at)) % 997
      const random = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648
        return seed / 2147483648
      }
      const particles = Array.from({ length: 26 }, (_, index) => {
        const x = 6 + random() * 308
        const y = 6 + random() * 128
        const r = 0.6 + random() * 1.5
        const o = 0.18 + random() * 0.62
        return h('circle', { key: `p-${index}`, cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2), opacity: o.toFixed(2) })
      })
      return h('svg', {
        viewBox: '0 0 320 140', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': label,
        className: 'dem-cover',
      },
        h('defs', null,
          // The mark is lit, not flat: a two-stop gradient reads as a glass edge.
          h('linearGradient', { id: `${uid}-mark`, x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0%', stopColor: tone.soft }),
            h('stop', { offset: '100%', stopColor: tone.solid })),
          // The plate: a deep base with the category's colour breathing from the middle.
          h('radialGradient', { id: `${uid}-base`, cx: '0.62', cy: '0.46', r: '0.78' },
            h('stop', { offset: '0%', stopColor: tone.solid, stopOpacity: 0.30 }),
            h('stop', { offset: '52%', stopColor: tone.solid, stopOpacity: 0.10 }),
            h('stop', { offset: '100%', stopColor: '#000000', stopOpacity: 0.55 })),
          h('radialGradient', { id: `${uid}-halo`, cx: '0.5', cy: '0.5', r: '0.5' },
            h('stop', { offset: '0%', stopColor: tone.soft, stopOpacity: 0.42 }),
            h('stop', { offset: '100%', stopColor: tone.soft, stopOpacity: 0 })),
          // The glow is what makes the subject read as emissive rather than painted.
          h('filter', { id: `${uid}-glow`, x: '-40%', y: '-40%', width: '180%', height: '180%' },
            h('feGaussianBlur', { stdDeviation: '4.2', result: 'blur' }),
            h('feMerge', null,
              h('feMergeNode', { in: 'blur' }),
              h('feMergeNode', { in: 'SourceGraphic' }))),
          h('linearGradient', { id: `${uid}-fade`, x1: '0', y1: '0', x2: '0', y2: '1' },
            h('stop', { offset: '0%', stopColor: '#000000', stopOpacity: 0 }),
            h('stop', { offset: '62%', stopColor: '#000000', stopOpacity: 0 }),
            h('stop', { offset: '100%', stopColor: '#000000', stopOpacity: 0.72 }))),
        // Base plate.
        h('rect', { x: 0, y: 0, width: 320, height: 140, fill: '#12131a' }),
        h('rect', { x: 0, y: 0, width: 320, height: 140, fill: `url(#${uid}-base)` }),
        // Orbit arcs crossing behind the subject.
        h('g', { fill: 'none', stroke: tone.soft, strokeOpacity: 0.34, strokeWidth: 1 },
          h('path', { d: 'M18 104C58 66 118 52 178 60c44 6 82 24 124 20' }),
          h('path', { d: 'M10 78C64 48 130 34 196 44c40 6 74 22 110 26', strokeOpacity: 0.2 }),
          h('ellipse', { cx: 214, cy: 68, rx: 96, ry: 34, strokeOpacity: 0.16, transform: 'rotate(-12 214 68)' })),
        // Particles behind, then the halo, then the subject on top.
        h('g', { fill: tone.soft }, particles),
        h('ellipse', { cx: 214, cy: 66, rx: 74, ry: 52, fill: `url(#${uid}-halo)` }),
        h('g', { transform: 'translate(160 6) scale(1.06)', filter: `url(#${uid}-glow)` },
          h('g', {
            className: 'dem-coverMark',
            fill: `url(#${uid}-mark)`,
            stroke: `url(#${uid}-mark)`,
            'fill-rule': 'evenodd',
          }, mark(tone))),
        // The bottom fade melts the plate into the card body below it.
        h('rect', { x: 0, y: 0, width: 320, height: 140, fill: `url(#${uid}-fade)` }))
    }

    /**
     * Category id → its palette: the tile's own tint, the mark's solid fill, and one
     * supporting tone. Both the tint and the fill are re-tuned per theme in the
     * stylesheet through these two roles alone, so a category keeps its identity.
     */
    const COVER_PALETTE = {
      interface: { tint: '#8cb4ff', solid: '#4d80e8', soft: '#8cb4ff' },
      appearance: { tint: '#ff9ecb', solid: '#e85f9d', soft: '#ff9ecb' },
      tools: { tint: '#7fe8b0', solid: '#2fbf7a', soft: '#7fe8b0' },
      skills: { tint: '#ffd77a', solid: '#f59e2e', soft: '#ffd77a' },
      memory: { tint: '#c4a4ff', solid: '#7c5cfa', soft: '#c4a4ff' },
      workflow: { tint: '#8fe0f5', solid: '#2fa8c9', soft: '#8fe0f5' },
      integrations: { tint: '#c9a6ff', solid: '#8b5cf6', soft: '#c9a6ff' },
      providers: { tint: '#ffb884', solid: '#f0733a', soft: '#ffb884' },
      usage: { tint: '#8cc6ff', solid: '#3b82f6', soft: '#8cc6ff' },
      development: { tint: '#a8e08a', solid: '#5aa83a', soft: '#a8e08a' },
      knowledge: { tint: '#dbe58a', solid: '#a8b83a', soft: '#dbe58a' },
      theme: { tint: '#b58cff', solid: '#7a4de8', soft: '#b58cff' },
      model: { tint: '#7fc4ff', solid: '#2f7fe0', soft: '#7fc4ff' },
      ui: { tint: '#9fa8ff', solid: '#5560d8', soft: '#9fa8ff' },
      session: { tint: '#7fe0e8', solid: '#2fa2ad', soft: '#7fe0e8' },
      skill: { tint: '#ffcf7a', solid: '#e0952e', soft: '#ffcf7a' },
      dev: { tint: '#8fe8b8', solid: '#2fa86a', soft: '#8fe8b8' },
      browser: { tint: '#8fd4ff', solid: '#2f88c9', soft: '#8fd4ff' },
      docs: { tint: '#c8d4ff', solid: '#6070d0', soft: '#c8d4ff' },
      vision: { tint: '#ff9fd4', solid: '#d84f9d', soft: '#ff9fd4' },
      voice: { tint: '#a8e0ff', solid: '#3f9fd8', soft: '#a8e0ff' },
      notify: { tint: '#ffc48f', solid: '#e0853a', soft: '#ffc48f' },
      security: { tint: '#8fb8ff', solid: '#3f63d8', soft: '#8fb8ff' },
      remote: { tint: '#8fe8dc', solid: '#2fa89a', soft: '#8fe8dc' },
      market: { tint: '#d8b8ff', solid: '#9250e0', soft: '#d8b8ff' },
      identity: { tint: '#a8ffd8', solid: '#2fb88a', soft: '#a8ffd8' },
      agi: { tint: '#ff9fb8', solid: '#e04f70', soft: '#ff9fb8' },
      git: { tint: '#ffb08f', solid: '#e0703a', soft: '#ffb08f' },
      fun: { tint: '#ffd88f', solid: '#e0a83a', soft: '#ffd88f' },
      wsl: { tint: '#9fbcff', solid: '#5068c8', soft: '#9fbcff' },
      fallback: { tint: '#a9b4c9', solid: '#6b7a93', soft: '#a9b4c9' },
    }

    /**
     * Category id → the function drawing its mark.
     *
     * Coordinates live in a 120×120 tile and every mark fills roughly two thirds of
     * it: at 44px on screen, only a large solid shape is legible, and the tint behind
     * it supplies the contrast in both themes.
     */
    const COVER_MARKS = {
      // interface: two stacked panels.
      interface: (p) => [
        h('rect', { x: 24, y: 26, width: 58, height: 44, rx: 10, opacity: 0.62 }),
        h('rect', { x: 40, y: 44, width: 58, height: 46, rx: 10 }),
        h('rect', { x: 52, y: 56, width: 32, height: 7, rx: 3.5, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.9 }),
        h('rect', { x: 52, y: 69, width: 20, height: 7, rx: 3.5, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.6 }),
      ],
      // appearance: a paint drop.
      appearance: (p) => [
        h('path', { d: 'M60 16c16 22 26 34 26 46a26 26 0 0 1-52 0c0-12 10-24 26-46z' }),
        h('ellipse', { cx: 50, cy: 52, rx: 6, ry: 9, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.75 }),
      ],
      // tools: a wrench.
      tools: (p) => [
        h('path', { d: 'M50 12a24 24 0 0 0 30 30l-24 24a16 16 0 0 1-22-22l24-24a24 24 0 0 0-8-8z' }),
        h('circle', { cx: 50, cy: 26, r: 7, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      // skills: a four-point spark.
      skills: (p) => [
        h('path', { d: 'M60 12l11 25 25 11-25 11-11 25-11-25-25-11 25-11z' }),
        h('path', { d: 'M94 74l6 13 13 6-13 6-6 13-6-13-13-6 13-6z' }),
      ],
      // memory: stacked slabs.
      memory: (p) => [
        h('path', { d: 'M60 14l46 20-46 20-46-20z' }),
        h('path', { d: 'M14 52l46 20 46-20-7-3-39 17-39-17z', opacity: 0.6 }),
        h('path', { d: 'M14 72l46 20 46-20-7-3-39 17-39-17z', opacity: 0.38 }),
      ],
      // workflow: three nodes joined.
      workflow: (p) => [
        h('rect', { x: 14, y: 18, width: 36, height: 26, rx: 8 }),
        h('rect', { x: 14, y: 76, width: 36, height: 26, rx: 8, opacity: 0.6 }),
        h('rect', { x: 70, y: 47, width: 36, height: 26, rx: 8 }),
        h('path', { d: 'M50 31h14a8 8 0 0 1 8 8v8M50 89h14a8 8 0 0 0 8-8v-8', strokeWidth: 5, fill: 'none', strokeLinecap: 'round', opacity: 0.55 }),
      ],
      // integrations: a hub with two satellites.
      integrations: (p) => [
        h('circle', { cx: 52, cy: 62, r: 26 }),
        h('circle', { cx: 96, cy: 30, r: 13 }),
        h('circle', { cx: 96, cy: 94, r: 13, opacity: 0.62 }),
        h('path', { d: 'M70 50l16-12M70 74l16 12', fill: 'none', strokeWidth: 6, strokeLinecap: 'round', opacity: 0.6 }),
        h('circle', { cx: 52, cy: 62, r: 10, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.85 }),
      ],
      // providers: a plug with two prongs.
      providers: (p) => [
        h('rect', { x: 28, y: 44, width: 62, height: 38, rx: 11 }),
        h('rect', { x: 40, y: 16, width: 12, height: 28, rx: 6 }),
        h('rect', { x: 66, y: 16, width: 12, height: 28, rx: 6 }),
        h('rect', { x: 53, y: 82, width: 12, height: 22, rx: 6, opacity: 0.6 }),
      ],
      // usage: three rising bars.
      usage: (p) => [
        h('rect', { x: 20, y: 60, width: 24, height: 44, rx: 7, opacity: 0.62 }),
        h('rect', { x: 50, y: 40, width: 24, height: 64, rx: 7, opacity: 0.82 }),
        h('rect', { x: 80, y: 18, width: 24, height: 86, rx: 7 }),
      ],
      // development: angle brackets.
      development: (p) => [
        h('path', { d: 'M44 22l-30 38 30 38 9-12-21-26 21-26z' }),
        h('path', { d: 'M76 22l30 38-30 38-9-12 21-26-21-26z', opacity: 0.6 }),
      ],
      // knowledge: an open book.
      knowledge: (p) => [
        h('path', { d: 'M58 24C46 17 34 13 16 13v74c18 0 30 4 42 12z' }),
        h('path', { d: 'M62 24c12-7 24-11 42-11v74c-18 0-30 4-42 12z', opacity: 0.6 }),
      ],
      // theme: a colour wheel quarter.
      theme: (p) => [
        h('path', { d: 'M60 12a48 48 0 0 0 0 96z', opacity: 0.62 }),
        h('path', { d: 'M60 12a48 48 0 0 1 0 96z' }),
        h('circle', { cx: 60, cy: 60, r: 15, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      // model: a layered cube.
      model: (p) => [
        h('path', { d: 'M60 14l46 24-46 24-46-24z' }),
        h('path', { d: 'M14 62l46 24 46-24-46-24z', opacity: 0.62 }),
        h('path', { d: 'M14 88l46 24 46-24', opacity: 0.4 }),
      ],
      // ui: a window with a header bar.
      ui: (p) => [
        h('rect', { x: 14, y: 26, width: 92, height: 68, rx: 12 }),
        h('rect', { x: 14, y: 26, width: 92, height: 20, rx: 12, opacity: 0.55 }),
        h('rect', { x: 28, y: 58, width: 34, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)' }),
        h('rect', { x: 28, y: 74, width: 52, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.6 }),
      ],
      // session: two speech bubbles.
      session: (p) => [
        h('path', { d: 'M18 20h58a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H42l-16 14V68a10 10 0 0 1-8-10V30a10 10 0 0 1 10-10z', opacity: 0.62 }),
        h('path', { d: 'M48 44h54a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10h-6v14l-14-14H48a10 10 0 0 1-10-10V54a10 10 0 0 1 10-10z' }),
      ],
      // skill: a shield with a star.
      skill: (p) => [
        h('path', { d: 'M60 12l42 16v34c0 26-18 44-42 52-24-8-42-26-42-52V28z' }),
        h('path', { d: 'M60 40l7 16 16 7-16 7-7 16-7-16-16-7 16-7z', fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.92 }),
      ],
      // dev: a terminal with a prompt.
      dev: (p) => [
        h('rect', { x: 12, y: 24, width: 96, height: 72, rx: 13 }),
        h('path', { d: 'M32 50l14 12-14 12', stroke: 'var(--dsw-alias-bg-layer-2)', strokeWidth: 7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('rect', { x: 58, y: 70, width: 26, height: 7, rx: 3.5, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      // browser: a globe.
      browser: (p) => [
        h('circle', { cx: 60, cy: 60, r: 46 }),
        h('ellipse', { cx: 60, cy: 60, rx: 20, ry: 46, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.28 }),
        h('rect', { x: 14, y: 54, width: 92, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.5 }),
      ],
      // docs: two sheets, one behind.
      docs: (p) => [
        h('rect', { x: 34, y: 16, width: 58, height: 74, rx: 10, opacity: 0.55 }),
        h('rect', { x: 24, y: 30, width: 58, height: 74, rx: 10 }),
        h('rect', { x: 38, y: 50, width: 32, height: 7, rx: 3.5, fill: 'var(--dsw-alias-bg-layer-2)' }),
        h('rect', { x: 38, y: 66, width: 22, height: 7, rx: 3.5, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.6 }),
      ],
      // vision: an eye.
      vision: (p) => [
        h('path', { d: 'M6 60c18-26 36-38 54-38s36 12 54 38c-18 26-36 38-54 38S24 86 6 60z' }),
        h('circle', { cx: 60, cy: 60, r: 18, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.92 }),
        h('circle', { cx: 60, cy: 60, r: 8 }),
      ],
      // voice: a microphone.
      voice: (p) => [
        h('rect', { x: 44, y: 12, width: 32, height: 56, rx: 16 }),
        h('path', { d: 'M28 58v6a32 32 0 0 0 64 0v-6', strokeWidth: 9, fill: 'none', strokeLinecap: 'round' }),
        h('rect', { x: 55, y: 92, width: 10, height: 18, rx: 5 }),
      ],
      // notify: a bell.
      notify: (p) => [
        h('path', { d: 'M60 14a30 30 0 0 1 30 30v22l10 18H20l10-18V44a30 30 0 0 1 30-30z' }),
        h('path', { d: 'M48 88a12 12 0 0 0 24 0z' }),
      ],
      // security: a lock.
      security: (p) => [
        h('rect', { x: 22, y: 50, width: 76, height: 58, rx: 12 }),
        h('path', { d: 'M38 50V38a22 22 0 0 1 44 0v12', strokeWidth: 10, fill: 'none', strokeLinecap: 'round' }),
        h('circle', { cx: 60, cy: 76, r: 7, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      // remote: a signal tower.
      remote: (p) => [
        h('path', { d: 'M60 44l22 66H38z', opacity: 0.62 }),
        h('path', { d: 'M40 34a28 28 0 0 1 40 0M28 22a46 46 0 0 1 64 0', strokeWidth: 8, fill: 'none', strokeLinecap: 'round' }),
        h('circle', { cx: 60, cy: 44, r: 9 }),
      ],
      // market: a shop awning over a counter.
      market: (p) => [
        h('path', { d: 'M14 34h92l-8 20H22z' }),
        h('rect', { x: 22, y: 54, width: 76, height: 50, rx: 10, opacity: 0.62 }),
        h('rect', { x: 46, y: 72, width: 28, height: 32, rx: 6, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      // identity: a badge with a person.
      identity: (p) => [
        h('rect', { x: 20, y: 20, width: 80, height: 80, rx: 20 }),
        h('circle', { cx: 60, cy: 50, r: 13, fill: 'var(--dsw-alias-bg-layer-2)' }),
        h('path', { d: 'M38 86c4-14 12-20 22-20s18 6 22 20', fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.75 }),
      ],
      // agi: an atom.
      agi: (p) => [
        h('ellipse', { cx: 60, cy: 60, rx: 46, ry: 18, fill: 'none', strokeWidth: 7 }),
        h('ellipse', { cx: 60, cy: 60, rx: 46, ry: 18, fill: 'none', strokeWidth: 7, transform: 'rotate(60 60 60)' }),
        h('ellipse', { cx: 60, cy: 60, rx: 46, ry: 18, fill: 'none', strokeWidth: 7, transform: 'rotate(120 60 60)' }),
        h('circle', { cx: 60, cy: 60, r: 11 }),
      ],
      // git: a branch graph.
      git: (p) => [
        h('circle', { cx: 34, cy: 26, r: 12 }),
        h('circle', { cx: 34, cy: 94, r: 12 }),
        h('circle', { cx: 86, cy: 58, r: 12 }),
        h('path', { d: 'M34 38v44M46 58h28', strokeWidth: 8, fill: 'none', strokeLinecap: 'round' }),
      ],
      // fun: a joystick.
      fun: (p) => [
        h('path', { d: 'M28 44h64a20 20 0 0 1 20 20v14a16 16 0 0 1-28 10l-8-10H44l-8 10a16 16 0 0 1-28-10V64a20 20 0 0 1 20-20z', opacity: 0.62 }),
        h('circle', { cx: 60, cy: 24, r: 14 }),
        h('rect', { x: 56, y: 36, width: 8, height: 14, rx: 4 }),
      ],
      // wsl: two panes joined.
      wsl: (p) => [
        h('rect', { x: 10, y: 24, width: 46, height: 72, rx: 10 }),
        h('rect', { x: 64, y: 24, width: 46, height: 72, rx: 10, opacity: 0.62 }),
        h('rect', { x: 50, y: 56, width: 20, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)' }),
      ],
      fallback: (p) => [
        h('rect', { x: 22, y: 26, width: 76, height: 68, rx: 13 }),
        h('rect', { x: 36, y: 44, width: 44, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.85 }),
        h('rect', { x: 36, y: 60, width: 28, height: 8, rx: 4, fill: 'var(--dsw-alias-bg-layer-2)', opacity: 0.55 }),
      ],
    }

    /** One hero category card: cover, title, up to three quick links, and a count. */
    function HeroCard({ category, t, language, nameOf, onOpenDetail, onOpenCategory }) {
      const tone = COVER_PALETTE[category.id] ?? COVER_PALETTE.fallback
      const style = {
        '--dem-hero-accent': tone.tint,
        '--dem-hero-deep': tone.solid,
        '--dem-hero-wash': tone.solid,
      }
      return h('section', { className: 'dem-heroCard', style },
        // Full-bleed artwork: the title is laid over its own fade, so the picture
        // leads and the name reads as part of it.
        h('button', {
          type: 'button', className: 'dem-heroCover', onClick: () => { onOpenCategory(category.id) },
          'aria-label': `${category.title} · ${t('heroMore')}`,
        },
          h(Cover, { id: category.id, label: category.title }),
          h('span', { className: 'dem-heroTitle' }, category.title)),
        h('div', { className: 'dem-heroBody' },
          h('ul', { className: 'dem-heroLinks' },
            ...category.entries.map(entry => h('li', { key: entry.name },
              h('button', {
                type: 'button', className: 'dem-heroLink', onClick: () => { onOpenDetail(entry) },
                title: nameOf(entry, language),
              }, h('span', { className: 'dem-heroLinkText' }, nameOf(entry, language)),
              h(IconChevronRight, { size: 12 }))))),
          // The count sits at the card's foot, after the links, so the three quick
          // entries read as the card's body and the total closes it.
          h('div', { className: 'dem-heroFoot' },
            h('span', { className: 'dem-heroCount' }, fill(t('heroCount'), { count: category.total })))))
    }

    /** One plugin card: icon, title, two description lines, keywords, and a foot with real figures. */
    function EntryCard({ entry, t, language, nameOf, categoryOf, heat, heatLabel, onOpen, onInstall, onUpdate, onOpenInstalled }) {
      const version = versionOf(entry)
      const title = nameOf(entry, language)
      const description = chineseText(entry.description, language)
      const keywords = Array.isArray(entry.metadata?.keywords) ? entry.metadata.keywords.slice(0, 3) : []
      const stars = starsOf(entry)
      const category = categoryOf(entry)
      const status = entry.installation?.status ?? 'not-installed'
      const canUpdate = version?.update === true
      const compatible = version?.compatibility?.compatible !== false || version?.compatibility?.exempted === true
      return h('article', { className: 'dem-card' },
        h('div', { className: 'dem-cardHead' },
          h(MarketIcon, { entry, size: CARD_ICON, onClick: onOpen }),
          h('div', { className: 'dem-cardTitleWrap' },
            h('button', { type: 'button', className: 'dem-cardTitle', onClick: onOpen, title }, title),
            h('span', { className: 'dem-cardMeta' },
              fill(t('entryMeta'), { version: version?.version ?? '—', date: formatDate(version?.publishTimestamp, language) }))),
          h('div', { className: 'dem-cardAction' },
            status === 'not-installed'
              ? h('button', {
                type: 'button', className: cls('dem-action', !compatible && 'dem-actionBlocked'),
                disabled: !compatible, 'aria-disabled': !compatible,
                title: compatible ? t('installHint') : t('blocked'),
                onClick: () => { if (compatible) onInstall(version) },
              }, t('install'))
              : canUpdate
                ? h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: () => { onUpdate(version) } }, t('update'))
                : h('button', { type: 'button', className: 'dem-action dem-actionGhost', onClick: onOpenInstalled },
                  h('span', { className: 'dem-dot' }), t(status === 'provided' ? 'provided' : 'installed')))),
        description === '' ? null : h('p', { className: 'dem-cardDesc', title: description }, trim(description, 96)),
        keywords.length === 0 ? null : h('ul', { className: 'dem-chips' },
          ...keywords.map(keyword => h('li', { key: keyword, className: 'dem-chip' }, keyword))),
        h('div', { className: 'dem-cardFoot' },
          category === '' ? null : h('span', { className: 'dem-chip dem-chipCategory', title: category }, category),
          h(Stat, { icon: h(IconStar, { size: 12 }), title: heatLabel ?? t('factStars') },
            typeof heat === 'number' && heat > 0
              ? compactNumber(heat, language)
              : (stars === undefined ? '' : compactNumber(stars, language))),
          h(Stat, { icon: h(IconDownload, { size: 12 }), title: t('factVersion') }, version?.version),
          entry.author === undefined ? null
            : h('span', { className: 'dem-author', title: entry.author }, trim(entry.author, 18))),
      )
    }

    // ---------------------------------------------------------------- detail

    /** The entry page: a WorkBuddy-style expert sheet with portrait, facts, document, and versions. */
    function DetailPage({ entry, listing, t, language, detail, nameOf, categoryOf, onBack, onLoadDetail, onInstall, onUpdate, onOpenInstalled, onAsk, canAsk }) {
      const version = versionOf(entry)
      const title = nameOf(entry, language)
      const description = chineseText(entry.description, language)
      const labels = Array.isArray(entry.metadata?.labels)
        ? entry.metadata.labels.map(id => listing.metadata?.labels?.[id]?.title).filter(Boolean)
        : []
      const keywords = Array.isArray(entry.metadata?.keywords) ? entry.metadata.keywords.slice(0, 6) : []
      const stars = starsOf(entry)
      const category = categoryOf(entry)
      const status = entry.installation?.status ?? 'not-installed'
      const compatible = version?.compatibility?.compatible !== false || version?.compatibility?.exempted === true
      const versionText = version?.version ?? '—'
      const key = JSON.stringify([language, listing.url, entry.name, version?.version])
      const document = detail[key]
      useEffect(() => {
        if (version !== undefined) onLoadDetail({ url: listing.url, name: entry.name, version: version.version, language })
      }, [key])
      return h('div', { className: 'dem-detail' },
        h('button', {
          type: 'button', className: 'dem-crumb', onClick: onBack,
          'aria-label': t('backLabel'), title: t('backLabel'),
        },
          h('span', { className: 'dem-crumbArrow', 'aria-hidden': true }, h(IconChevronRight, { size: 13 })),
          h('span', null, t('back'))),
        h('header', { className: 'dem-detailHead' },
          h(MarketIcon, { entry, size: DETAIL_ICON }),
          h('div', { className: 'dem-detailIdentity' },
            h('h2', { className: 'dem-detailTitle' }, title),
            h('p', { className: 'dem-detailByline' },
              entry.author === undefined ? entry.name : entry.author,
              h('span', { className: 'dem-sep' }, '·'),
              h('span', { className: 'dem-detailIndex' }, textOf(listing.title, language) || listing.url)),
            h('div', { className: 'dem-detailButtons' },
              status === 'not-installed'
                ? h('button', {
                  type: 'button', className: 'dem-primary', disabled: !compatible,
                  onClick: () => { if (compatible) onInstall(version) },
                }, t('install'))
                : version?.update === true
                  ? h('button', { type: 'button', className: 'dem-primary', onClick: () => { onUpdate(version) } }, t('update'))
                  : h('button', { type: 'button', className: 'dem-primary dem-primaryQuiet', onClick: onOpenInstalled }, t('installed')),
              h('button', {
                type: 'button', className: 'dem-secondary', disabled: canAsk !== true,
                title: canAsk === true ? undefined : t('askUnavailable'),
                onClick: () => { if (canAsk === true) onAsk(entry, versionText) },
              }, h(IconSpark, { size: 14 }), t('answer')))),
        ),
        description === '' ? null : h('p', { className: 'dem-detailDesc' }, description),
        h('ul', { className: 'dem-detailTags' },
          category === undefined ? null : h('li', { className: 'dem-chip' }, textOf(category, language)),
          ...keywords.map(keyword => h('li', { key: keyword, className: 'dem-chip' }, keyword)),
          ...labels.map(label => h('li', { key: `l-${textOf(label, language)}`, className: 'dem-chip dem-chipTone' }, textOf(label, language)))),
        h('dl', { className: 'dem-facets' },
          h('div', null,
            h('dt', null, versionText),
            h('dd', null, t('factVersion'))),
          h('div', null,
            h('dt', null, stars === undefined ? t('noData') : compactNumber(stars, language)),
            h('dd', null, t('factStars'))),
          h('div', null,
            h('dt', { className: 'dem-facetWide' },
              entry.author === undefined ? t('noData') : trim(entry.author, 22)),
            h('dd', null, t('factAuthor')))),
        h('section', { className: 'dem-detailSection' },
          h('h3', { className: 'dem-sectionTitle' }, t('whatItDoes')),
          h(DetailDocument, { state: document, t, onRetry: () => { onLoadDetail({ url: listing.url, name: entry.name, version: version?.version, language, refresh: true }) } })),
        h('section', { className: 'dem-detailSection' },
          h('h3', { className: 'dem-sectionTitle' }, t('more')),
          h('dl', { className: 'dem-facts' },
            ...factsOf(entry, version, listing, t, language).map(fact => h('div', { key: fact.label },
              h('dt', null, fact.label),
              h('dd', null, fact.href === undefined
                ? fact.value
                : h('a', { className: 'dem-link', href: fact.href, target: '_blank', rel: 'noopener noreferrer' }, fact.value)))))))
    }

    /** The read-only fact rows of one entry version. */
    function factsOf(entry, version, listing, t, language) {
      const facts = [{ label: t('factPackage'), value: `${entry.name}${version === undefined ? '' : `@${version.version}`}` }]
      const source = version?.source
      if (source?.type === 'npm') {
        facts.push({ label: t('factRegistry'), value: source.registry ?? 'npm' })
      } else if (source?.type === 'git') {
        facts.push({ label: t('factRepository'), value: source.url, href: source.url })
        facts.push({ label: t('factCommit'), value: String(source.commit).slice(0, 12) })
        if (source.path !== undefined) facts.push({ label: t('factDirectory'), value: source.path })
      }
      if (entry.repository?.url !== undefined) facts.push({ label: t('factSource'), value: entry.repository.url, href: entry.repository.url })
      if (entry.homepage !== undefined) facts.push({ label: t('factHomepage'), value: entry.homepage, href: entry.homepage })
      const published = formatDate(version?.publishTimestamp, language)
      if (published !== '') facts.push({ label: t('factPublished'), value: published })
      return facts
    }

    /** A detail document: Markdown, or the loading, missing, and failure states. */
    function DetailDocument({ state, t, onRetry }) {
      if (state === undefined || state.status === 'loading') {
        return h('p', { className: 'dem-docNote' }, t('detailLoading'))
      }
      if (state.status === 'error') {
        return h('div', { className: 'dem-docNote' },
          h('span', null, `${t('detailFailed')}${state.message === '' ? '' : `：${state.message}`}`),
          h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: onRetry }, t('retry')))
      }
      const detail = state.detail
      if (detail === undefined || detail.status !== 'found' || typeof detail.markdown !== 'string') {
        return h('p', { className: 'dem-docNote' }, t('detailFallback'))
      }
      return h(Markdown, { text: detail.markdown, url: detail.url })
    }

    /**
     * A deliberately small Markdown renderer: headings, paragraphs, lists,
     * fenced code, quotes, and inline emphasis, links, and code. The detail page
     * must not import a Harness Client package, and a full parser would be a
     * dependency this bundle cannot ship, so it renders the subset README files
     * actually use and leaves anything else as text.
     */
    function Markdown({ text }) {
      const blocks = useMemo(() => markdownBlocks(text), [text])
      return h('div', { className: 'dem-md' },
        ...blocks.map((block, index) => {
          const key = `b-${index}`
          switch (block.kind) {
            case 'h': return h(`h${Math.min(block.level + 2, 6)}`, { key, className: 'dem-mdHead' }, ...inline(block.text))
            case 'code': return h('pre', { key, className: 'dem-mdCode' }, h('code', null, block.text))
            case 'quote': return h('blockquote', { key, className: 'dem-mdQuote' }, ...inline(block.text))
            case 'list': return h('ul', { key, className: 'dem-mdList' },
              ...block.items.map((item, itemIndex) => h('li', { key: itemIndex }, ...inline(item))))
            case 'rule': return h('hr', { key, className: 'dem-mdRule' })
            default: return h('p', { key, className: 'dem-mdP' }, ...inline(block.text))
          }
        }))
    }

    /** Split inline Markdown into text, code, strong, and link nodes. */
    function inline(source) {
      const nodes = []
      const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g
      let last = 0
      let match = pattern.exec(source)
      while (match !== null) {
        if (match.index > last) nodes.push(source.slice(last, match.index))
        if (match[1] !== undefined) nodes.push(h('code', { key: `c-${match.index}`, className: 'dem-mdInlineCode' }, match[1].slice(1, -1)))
        else if (match[2] !== undefined) nodes.push(h('strong', { key: `s-${match.index}` }, match[2].slice(2, -2)))
        else {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(match[3])
          const href = link === null ? undefined : link[2]
          const safe = href !== undefined && /^(https?:|mailto:)/i.test(href)
          nodes.push(safe
            ? h('a', { key: `a-${match.index}`, className: 'dem-link', href, target: '_blank', rel: 'noopener noreferrer' }, link[1])
            : (link === null ? match[3] : link[1]))
        }
        last = match.index + match[0].length
        match = pattern.exec(source)
      }
      if (last < source.length) nodes.push(source.slice(last))
      return nodes
    }

/** Parsed blocks by document text, bounded so a long session cannot grow it. */
    const markdownCache = new Map()

    /** Parse a document once and reuse the blocks, for every re-render of the page. */
    function markdownBlocks(text) {
      const key = String(text)
      const cached = markdownCache.get(key)
      if (cached !== undefined) return cached
      const blocks = parseMarkdown(key)
      if (markdownCache.size > 40) markdownCache.delete(markdownCache.keys().next().value)
      markdownCache.set(key, blocks)
      return blocks
    }

    /** Group Markdown lines into blocks. */
    function parseMarkdown(source) {
      const lines = String(source).replace(/\r\n?/g, '\n').split('\n')
      const blocks = []
      let paragraph = []
      const flush = () => {
        if (paragraph.length === 0) return
        blocks.push({ kind: 'p', text: paragraph.join(' ').trim() })
        paragraph = []
      }
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        if (/^\s*```/.test(line)) {
          flush()
          const body = []
          index += 1
          while (index < lines.length && !/^\s*```/.test(lines[index])) { body.push(lines[index]); index += 1 }
          blocks.push({ kind: 'code', text: body.join('\n') })
          continue
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line)
        if (heading !== null) {
          flush()
          blocks.push({ kind: 'h', level: heading[1].length, text: heading[2].trim() })
          continue
        }
        if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { flush(); blocks.push({ kind: 'rule' }); continue }
        if (/^\s*>\s?/.test(line)) { flush(); blocks.push({ kind: 'quote', text: line.replace(/^\s*>\s?/, '') }); continue }
        const item = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line)
        if (item !== null) {
          flush()
          const items = [item[1]]
          while (index + 1 < lines.length && /^\s*(?:[-*+]|\d+[.)])\s+/.test(lines[index + 1])) {
            index += 1
            items.push(lines[index].replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''))
          }
          blocks.push({ kind: 'list', items })
          continue
        }
        if (line.trim() === '') { flush(); continue }
        if (/^\s*<[^>]+>\s*$/.test(line)) { flush(); continue }
        paragraph.push(line.trim())
      }
      flush()
      return blocks
    }

    // ---------------------------------------------------------------- install dialog

    const PHASE_LABEL = {
      confirm: 'installConfirm',
      starting: 'installPhaseStarting',
      installing: 'installPhaseInstalling',
      applying: 'installPhaseApplying',
      cancelling: 'installPhaseCancelling',
      done: 'installPhaseDone',
      failed: 'installPhaseFailed',
      cancelled: 'installPhaseCancelled',
      unknown: 'installPhaseUnknown',
    }

    /** The install dialog: confirmation facts, live phase, log tail, and cancel or retry. */
    function InstallDialog({ install, t, language, onCancel, onClose, onRetry, onApprove, onConfirm, onOpenInstalled }) {
      const dialogRef = useRef(null)
      const returnFocus = useRef(null)
      useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (install.phase === 'starting' || install.phase === 'installing' || install.phase === 'applying' || install.phase === 'cancelling') return
          event.stopPropagation()
          onClose()
        }
        const onTab = (event) => {
          if (event.key !== 'Tab' || dialogRef.current === null) return
          const focusable = dialogRef.current.querySelectorAll?.(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ) ?? []
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          const active = document.activeElement
          // Keep Tab inside the dialog: wrap at both ends, and pull focus back when it escaped.
          if (event.shiftKey && (active === first || active === dialogRef.current)) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && active === last) {
            event.preventDefault()
            first.focus()
          } else if (active !== null && active !== dialogRef.current && dialogRef.current.contains?.(active) === false) {
            event.preventDefault()
            first.focus()
          }
        }
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('keydown', onTab, true)
        return () => {
          document.removeEventListener('keydown', onKey, true)
          document.removeEventListener('keydown', onTab, true)
        }
      }, [install.phase, onClose])
      useEffect(() => {
        // Remember where focus came from so closing hands it back, then move focus in.
        returnFocus.current = document.activeElement ?? null
        const first = dialogRef.current?.querySelector?.('button:not(:disabled)')
        if (first !== undefined && first !== null) first.focus()
        else dialogRef.current?.focus?.()
        return () => {
          const previous = returnFocus.current
          returnFocus.current = null
          if (previous !== null && previous !== undefined && previous.focus !== undefined && previous.isConnected !== false) previous.focus()
        }
      }, [])
      if (!install.open) return null
      const running = install.phase === 'starting' || install.phase === 'installing' || install.phase === 'applying' || install.phase === 'cancelling'
      const confirming = install.phase === 'confirm'
      const title = install.title ?? install.entry?.name ?? ''
      const version = install.version?.version ?? ''
      return h('div', { className: 'dem-modalLayer', role: 'presentation', onMouseDown: (event) => {
        if (event.target === event.currentTarget && !running) onClose()
      } },
      h('div', {
        className: 'dem-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dem-modal-title', ref: dialogRef,
      },
        h('header', { className: 'dem-modalHead' },
          h('div', { className: 'dem-modalIdentity' },
            install.entry == null ? null : h(MarketIcon, { entry: install.entry, size: 32 }),
            h('div', null,
              h('h2', { className: 'dem-modalTitle', id: 'dem-modal-title' }, title === '' ? t('installDialog') : title),
              h('p', { className: 'dem-modalMeta' }, `${version === '' ? install.spec : `v${version}`}`))),
          h('button', { type: 'button', className: 'dem-iconButton', onClick: onClose, disabled: running, 'aria-label': t('installClose') },
            h(IconClose, null))),
        h('div', { className: 'dem-modalBody' },
          h('p', { className: cls('dem-phase', `dem-phase-${install.phase}`), role: 'status', 'aria-live': 'polite' },
            running ? h('span', { className: 'dem-spinner', 'aria-hidden': true }) : null,
            t(PHASE_LABEL[install.phase] ?? 'installPhaseStarting')),
          h('dl', { className: 'dem-facts dem-factsCompact' },
            h('div', null, h('dt', null, t('installSpec')), h('dd', null, h('code', null, install.spec))),
            version === '' ? null : h('div', null, h('dt', null, t('factVersion')), h('dd', null, h('code', null, version)))),
          install.phase === 'done' && install.restartRequired === true
            ? h('p', { className: 'dem-notice' }, t('installRestart'))
            : null,
          install.phase === 'failed' && Array.isArray(install.pendingBuilds) && install.pendingBuilds.length > 0
            ? h('div', { className: 'dem-notice dem-noticeWarn' },
              h('p', null, fill(t('installBuilds'), { names: install.pendingBuilds.join(', ') })),
              h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: () => { onApprove(install.pendingBuilds) } },
                t('installApprove')))
            : null,
          install.phase === 'failed' && install.failure
            ? h('p', { className: 'dem-error', role: 'alert' }, install.failure)
            : null,
          install.note === 'too-late' ? h('p', { className: 'dem-notice' }, t('installCancelledTooLate')) : null,
          install.runs.length === 0 ? null : h('details', { className: 'dem-log' },
            h('summary', null, t('installLog')),
            h('pre', { className: 'dem-logBody' }, install.runs.map(run => run.text).join('').split('\n').slice(-40).join('\n'))),
          install.phase === 'done' ? null : h('p', { className: 'dem-notice' }, t('installTrust'))),
        h('footer', { className: 'dem-modalFoot' },
          confirming
            ? [h('button', { key: 'cancel', type: 'button', className: 'dem-secondary', onClick: onClose }, t('installClose')),
              h('button', { key: 'go', type: 'button', className: 'dem-primary', autoFocus: true, onClick: onConfirm }, t('installRun'))]
            : install.phase === 'done'
            ? [h('button', { key: 'open', type: 'button', className: 'dem-secondary', onClick: onOpenInstalled }, t('installOpenInstalled')),
              h('button', { key: 'close', type: 'button', className: 'dem-primary', onClick: onClose }, t('installClose'))]
            : install.phase === 'failed'
              ? [h('button', { key: 'close', type: 'button', className: 'dem-secondary', onClick: onClose }, t('installClose')),
                h('button', { key: 'retry', type: 'button', className: 'dem-primary', onClick: onRetry }, t('installRetry'))]
              : install.phase === 'cancelled'
                ? [h('button', { key: 'close', type: 'button', className: 'dem-primary', onClick: onClose }, t('installClose'))]
                : [h('button', {
                  key: 'cancel', type: 'button', className: 'dem-secondary', disabled: install.cancelling === true || install.phase === 'applying',
                  onClick: onCancel,
                }, t('installCancel'))])))
    }

    // ---------------------------------------------------------------- page

    /** The page body: toolbar, hero row, category pills, and the card grid, or one entry page. */
    function MarketPage({ controller, t, surface }) {
      const state = useStore(controller.store)
      const language = useLocaleSnapshot(controller.ctx)
      const [text, setText] = useState(state.query.text)
      const [opened, setOpened] = useState(null)
      // Own scroll surface, reset whenever the view changes so a reader who opened the
      // third screen of cards starts the plugin page at its top.
      const scroll = useRef(null)
      const resetScroll = useCallback(() => {
        if (scroll.current !== null) scroll.current.scrollTop = 0
      }, [])
      useEffect(() => { controller.ensure() }, [])
      // `listing` is read by the resolvers below, so it is bound first.
      const listing = state.listing
      const nameOf = useCallback((entry, language) => controller.nameOf(entry, language), [state.names])
      // An entry names its category by id; the listing carries the display titles.
      const categoryOf = useCallback((entry) => {
        const source = opened?.listing?.metadata ?? listing?.metadata
        const id = entry.metadata?.category
        if (id === undefined) return ''
        const title = source?.categories?.[id]?.title
        return textOf(title, language) || ''
      }, [listing, opened, language])
      // The opened entry is a snapshot: a reload, a search, or an install must not
      // throw the reader out of the page they are reading.
      const entry = opened === null ? null : opened.entry
      const openDetail = useCallback((target) => {
        setOpened({ name: target.name, entry: target, listing })
        resetScroll()
      }, [listing, resetScroll])
      const back = useCallback(() => {
        setOpened(null)
        resetScroll()
      }, [resetScroll])
      const openCategory = useCallback((id) => {
        setOpened(null)
        resetScroll()
        controller.search({ ...controller.snapshot.query, category: id, text: '' })
        setText('')
      }, [resetScroll, controller])
      const openInstalled = useCallback(() => {
        // The Plugins page owns panel id 'plugins'; the entry page opens in its Installed tab.
        controller.ctx.get('layout')?.selectPanel?.('plugins')
      }, [])
      const canAsk = controller.ctx.get('uiWorkspace') !== undefined
      const ask = useCallback((target, versionText) => {
        const workspace = controller.ctx.get('uiWorkspace')
        if (workspace === undefined) return
        const title = controller.nameOf(target, language)
        workspace.startSession(undefined, { prompt: fill(t('answerPrompt'), { name: `${title} (${target.name}@${versionText})` }) })
      }, [language])
      const install = useCallback((target, version) => {
        if (version === undefined) return
        controller.prepareInstall(target, version)
      }, [])
      const confirmInstall = useCallback(() => { void controller.runInstall() }, [])
      const retryInstall = useCallback(() => { void controller.runInstall() }, [])
      const approve = useCallback((builds) => { void controller.runInstall(builds) }, [])

      // The Host returns one page; the filters narrow it without another read.
      const now = Date.now()
      const shown = listing === null ? [] : listing.entries.filter(item => passes(item, state.filter, now))
      const sorts = sortOptions(listing, state.query, t, language)
      const categories = listing === null ? [] : categoryOptions(listing, language)

      // The panel is a scroll surface of its own; the host frame stays untouched.
      // `surface` says where this page is mounted: the sidebar panel owns its own
      // scrolling, while the Plugins page already provides one.
      return h('div', { className: 'dem-root', 'data-expert-market': true, 'data-surface': surface ?? 'panel' },
        h('div', { className: 'dem-scroll', ref: scroll },
          h('header', { className: 'dem-head' },
            h('div', { className: 'dem-headTop' },
              h('div', { className: 'dem-headText' },
                h('h1', { className: 'dem-title' }, t('title')),
                h('p', { className: 'dem-subtitle' }, t('subtitle'))),
              h('div', { className: 'dem-toolbar' },
                state.indexes.length <= 1 ? null
                  : h(IndexMenu, {
                    indexes: state.indexes, current: state.url, language, t,
                    onSelect: (url) => {
                      setText('')
                      setOpened(null)
                      resetScroll()
                      controller.selectIndex(url)
                    },
                    onAdd: (url) => controller.addIndex(url),
                    onRemove: (url) => controller.removeIndex(url),
                  }),
                h('div', { className: 'dem-searchWrap' },
                  h('div', { className: 'dem-search' },
                  h(IconSearch, { size: 14 }),
                  h('input', {
                    className: 'dem-searchInput', type: 'search', value: text, placeholder: t('search'),
                    'aria-label': t('searchLabel'),
                    onChange: (event) => {
                      const next = event.target.value
                      setText(next)
                      controller.search({ ...controller.snapshot.query, text: next })
                    },
                  })),
                  h('span', { className: 'dem-searchHint' }, t('searchBoth'))),
                h('button', {
                  type: 'button', className: 'dem-ghost dem-ghostIcon', 'aria-label': t('refresh'),
                  disabled: state.status === 'loading',
                  onClick: () => { controller.reload() },
                }, h(IconRefresh, null)))),
            h('div', { className: 'dem-tabs', role: 'tablist', 'aria-label': t('title') },
              h('button', {
                type: 'button', role: 'tab', 'aria-selected': state.view === VIEW_MARKET,
                className: cls('dem-tab', state.view === VIEW_MARKET && 'dem-tabActive'),
                onClick: () => { setOpened(null); resetScroll(); controller.setView(VIEW_MARKET) },
              }, t('tabMarket')),
              h('button', {
                type: 'button', role: 'tab', 'aria-selected': state.view === VIEW_INSTALLED,
                className: cls('dem-tab', state.view === VIEW_INSTALLED && 'dem-tabActive'),
                onClick: () => { setOpened(null); resetScroll(); controller.setView(VIEW_INSTALLED) },
              }, t('tabInstalled'),
              state.installed.status === 'ready' && state.installed.rows.length > 0
                ? h('span', { className: 'dem-tabCount' }, String(state.installed.rows.length))
                : null)),

          state.view === VIEW_INSTALLED
            ? (state.installed.opened === null
              ? h(InstalledView, {
                installed: state.installed, t, language, nameOf,
                onToggle: (name, enabled) => { void controller.setInstalledEnabled(name, enabled) },
                onRemove: (name) => { void controller.removeInstalled(name) },
                onBrowse: () => { controller.setView(VIEW_MARKET) },
                onOpen: (name) => { controller.openInstalled(name) },
                onCheck: () => { void controller.checkUpdates() },
                onUpdateAll: () => { void controller.updateAll() },
                onUpdate: (name, target) => { void controller.updateOne(name, target) },
                onDismissBatch: () => { controller.dismissBatch() },
              })
              : h(InstalledDetail, {
                installed: state.installed, t,
                onBack: () => { controller.closeInstalled() },
                onRetry: () => { controller.retryInstalledDocument() },
              }))
            : state.status === 'unsupported'
            ? h(Empty, { title: t('unsupported'), description: t('unsupportedHint') })
            : state.status === 'error'
              ? h(Empty, {
                title: state.failure === 'indexes' ? t('failedIndexes') : t('failedListing'),
                description: state.reason === '' ? undefined : state.reason,
                action: h('div', { className: 'dem-emptyActions' },
                  h('button', { type: 'button', className: 'dem-action', onClick: () => { controller.reload() } }, t('retry')),
                  h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: openInstalled }, t('openPlugins'))),
              })
              : state.status === 'empty'
                ? h(Empty, {
                  title: t('emptySource'), description: t('emptySourceHint'),
                  action: h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: openInstalled }, t('openPlugins')),
                })
                : (state.status === 'loading' || state.status === 'refreshing') && listing === null
                  ? h(Skeleton, { label: t('loading') })
                  : entry !== null
                    ? h(DetailPage, {
                      key: entry.name, entry, listing: opened.listing ?? listing, t, language, nameOf, categoryOf,
                      detail: state.detail, onBack: back,
                      onLoadDetail: (request) => { void controller.loadDetail(request) },
                      onInstall: (version) => { install(entry, version) },
                      onUpdate: (version) => { install(entry, version) },
                      onOpenInstalled: openInstalled,
                      onAsk: ask,
                      canAsk,
                    })
                    : h('div', { className: cls('dem-browse', state.status === 'refreshing' && 'dem-browseBusy'), 'aria-busy': state.status === 'refreshing' || undefined },
                      state.hero.length === 0 && state.heroLoading !== true ? null : h('section', {
                        className: 'dem-heroSection', 'aria-label': t('heroTitle'),
                      },
                        h('div', { className: 'dem-heroCards' },
                          ...(state.hero.length === 0
                            ? Array.from({ length: 6 }, (_, index) => h('div', {
                              key: `hs-${index}`, className: 'dem-heroCard dem-skeleton', 'aria-hidden': true,
                            },
                              h('div', { className: 'dem-skeletonCover' }),
                              h('div', { className: 'dem-heroBody' },
                                h('div', { className: 'dem-skeletonBar', style: { width: '52%' } }),
                                h('div', { className: 'dem-skeletonBar', style: { width: '78%' } }),
                                h('div', { className: 'dem-skeletonBar', style: { width: '64%' } }))))
                            : state.hero.map(category => h(HeroCard, {
                              key: category.id, category, t, language, nameOf,
                              onOpenDetail: openDetail, onOpenCategory: openCategory,
                            }))))),
                      h('hr', { className: 'dem-divider', 'aria-hidden': true }),
                      state.hot.length === 0 && state.hotLoading !== true ? null : h('section', {
                        className: 'dem-hotSection', 'aria-label': t('hotTitle'),
                      },
                        h('div', { className: 'dem-hotHead' },
                          h('h2', { className: 'dem-hotTitle' }, t('hotTitle')),
                          h('span', { className: 'dem-hotHint' }, t('hotHint'))),
                        h('ol', { className: 'dem-hotList' },
                          ...(state.hot.length === 0
                            ? Array.from({ length: 16 }, (_, index) => h('li', {
                              key: `hs-${index}`, className: 'dem-hotItem dem-hotSkeleton', 'aria-hidden': true,
                            }, h('span', { className: 'dem-skeletonBar', style: { width: '38%' } })))
                            : state.hot.slice(0, 16).map((item, index) => {
                              const meta = categoryOf(item.entry)
                              return h('li', { key: `hot-${item.entry.name}`, className: 'dem-hotItem' },
                                h('span', { className: 'dem-hotRank', 'aria-hidden': true }, String(index + 1)),
                                h('button', {
                                  type: 'button', className: 'dem-hotName', title: nameOf(item.entry, language),
                                  onClick: () => { openDetail(item.entry) },
                                }, nameOf(item.entry, language)),
                                meta === '' ? null : h('span', { className: 'dem-hotMeta' }, meta))
                            })))),
                      h('hr', { className: 'dem-divider', 'aria-hidden': true }),
                      state.fromCache === true
                        ? h('p', { className: 'dem-cacheNote', role: 'status' }, t('fromCacheHint'))
                        : null,
                      h('div', { className: 'dem-listHead' },
                        h('div', { className: 'dem-listTitle' },
                          h('h2', null, t('browse')),
                          listing === null ? null : h('span', { className: 'dem-count' }, String(listing.total))),
                        h('div', { className: 'dem-sorts', role: 'group', 'aria-label': t('sort') },
                          ...sorts.map(option => h(Pill, {
                            key: option.id, active: option.id === sortIdOf(state.query.sort), pressed: option.id === sortIdOf(state.query.sort),
                            onClick: () => { controller.search({ ...controller.snapshot.query, sort: option.sort }) },
                          }, option.label)))),
                      h('hr', { className: 'dem-divider', 'aria-hidden': true }),
                      h(FilterBar, { filter: state.filter, t, onChange: (next) => { controller.setFilter(next) } }),
                      h('hr', { className: 'dem-divider', 'aria-hidden': true }),
                      categories.length === 0 ? null : h('div', { className: 'dem-pills', role: 'group', 'aria-label': t('categoriesLabel') },
                        h(Pill, {
                          active: state.query.category === null,
                          onClick: () => { controller.search({ ...controller.snapshot.query, category: null }) },
                        }, t('all')),
                        ...categories.map(category => h(Pill, {
                          key: category.id, active: state.query.category === category.id,
                          onClick: () => { controller.search({ ...controller.snapshot.query, category: category.id }) },
                        }, category.title))),
                      state.status === 'refreshing'
                        ? h('p', { className: 'dem-muted', role: 'status' }, t('loadingList'))
                        : null
                      , listing === null || listing.entries.length === 0
                        ? h('p', { className: 'dem-muted' }, t('noMatch'))
                        : shown.length === 0
                          ? h('p', { className: 'dem-muted' }, t('filterEmpty'))
                          : h('div', { className: 'dem-grid', 'aria-busy': state.busyMore === true },
                          ...shown.map(item => h(EntryCard, {
                            key: item.name, entry: item, t, language, nameOf, categoryOf,
                            onOpen: () => { openDetail(item) },
                            onInstall: (version) => { install(item, version) },
                            onUpdate: (version) => { install(item, version) },
                            onOpenInstalled: openInstalled,
                          }))),
                      listing === null ? null : h(Pager, {
                          page: pageOf(state.offset),
                          pages: pageCount(listing.total),
                          busy: state.paging === true || state.status === 'refreshing',
                          t,
                          onPage: (page) => { void controller.goToPage(page) },
})))),

        h(InstallDialog, {
          install: state.install, t, language,
          onCancel: () => { void controller.cancelInstall() },
          onClose: () => { controller.closeInstall() },
          onRetry: retryInstall,
          onApprove: approve,
          onConfirm: confirmInstall,
          onOpenInstalled: () => { controller.closeInstall(); openInstalled() },
        }))
    }

    /** The plugin-source menu: a disclosure button plus arrow-navigable radio items. */
    /**
     * The plugin-source control: pick which index the page reads, and add or remove
     * sources through the same profile setting the Plugins page writes.
     */
    function IndexMenu({ indexes, current, language, t, onSelect, onAdd, onRemove }) {
      const [open, setOpen] = useState(false)
      const [draft, setDraft] = useState('')
      const [error, setError] = useState('')
      const [busy, setBusy] = useState(false)
      const [editing, setEditing] = useState(false)
      const wrap = useRef(null)
      const button = useRef(null)
      const items = useRef(null)
      const currentIndex = indexes.find(index => index.url === current)
      useEffect(() => {
        if (!open) return undefined
        const onDown = (event) => {
          if (wrap.current?.contains?.(event.target) === true) return
          setOpen(false)
          setEditing(false)
        }
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            setOpen(false)
            setEditing(false)
            button.current?.focus?.()
            return
          }
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          const nodes = [...(items.current?.querySelectorAll?.('[role="menuitemradio"]:not(:disabled)') ?? [])]
          if (nodes.length === 0) return
          const at = nodes.indexOf(document.activeElement)
          const step = event.key === 'ArrowDown' ? 1 : -1
          const next = at === -1 ? (step === 1 ? 0 : nodes.length - 1) : (at + step + nodes.length) % nodes.length
          nodes[next].focus()
        }
        document.addEventListener('mousedown', onDown, true)
        document.addEventListener('keydown', onKey, true)
        return () => {
          document.removeEventListener('mousedown', onDown, true)
          document.removeEventListener('keydown', onKey, true)
        }
      }, [open])

      const submit = async (event) => {
        event.preventDefault()
        const value = draft.trim()
        if (value === '' || busy) return
        setBusy(true)
        setError('')
        const result = await onAdd(value)
        setBusy(false)
        if (result?.ok === true) { setDraft(''); setEditing(false) }
        else setError(fill(t('indexFailed'), { reason: result?.reason ?? '' }))
      }

      const sourceRow = (index) => {
        // `error` can outlive a good read, and a source that still has a title is
        // serving; only one with nothing to show is marked, and even then it stays
        // selectable so the reader can see what the failure says.
        const broken = index.error !== undefined && index.title === undefined
        return h('div', { key: index.url, className: 'dem-sourceRow' },
        h('button', {
          type: 'button', role: 'menuitemradio', 'aria-checked': index.url === current,
          className: cls('dem-menuItem', index.url === current && 'dem-menuItemActive', broken && 'dem-menuItemBroken'),
          title: index.error === undefined ? index.url : String(index.error),
          onClick: () => { onSelect(index.url); setOpen(false) },
        },
          h('span', { className: 'dem-sourceName' }, indexLabel(index, language)),
          broken ? h('span', { className: 'dem-sourceBad' }, t('indexBroken')) : null,
          // The selected row carries a visible tick and a bar, not only a colour
          // difference: on a dark menu a weight change alone is easy to miss.
          index.url === current
            ? h('span', { className: 'dem-sourceCurrent', 'aria-hidden': true },
              h('span', { className: 'dem-sourceCurrentText' }, t('indexCurrent')),
              h(IconCheck, { size: 13 }))
            : null),
        h('button', {
          type: 'button', className: 'dem-sourceRemove',
          'aria-label': fill(t('indexRemoveNamed'), { url: index.url }),
          title: t('indexRemove'),
          onClick: async () => {
            setBusy(true)
            await onRemove(index.url)
            setBusy(false)
          },
        }, h(IconClose, { size: 12 })))
      }

      return h('div', { className: 'dem-menuWrap', ref: wrap },
        h('button', {
          type: 'button', className: 'dem-ghost', 'aria-haspopup': 'menu', 'aria-expanded': open, ref: button,
          'aria-label': fill(t('indexMenuLabel'), { market: indexLabel(currentIndex, language) }),
          onClick: () => { setOpen(value => !value) },
        }, h('span', { className: 'dem-menuName' }, indexLabel(currentIndex, language)), h(IconChevronDown, { size: 12 })),
        open ? h('div', { className: 'dem-menu', role: 'menu', ref: items, 'aria-label': t('indexMenu') },
          indexes.length === 0
            ? h('p', { className: 'dem-menuEmpty' }, t('indexEmpty'))
            : h('div', { className: 'dem-sourceList' }, ...indexes.map(sourceRow)),
          h('div', { className: 'dem-menuSep', 'aria-hidden': true }),
          editing
            ? h('form', { className: 'dem-sourceForm', onSubmit: submit },
              h('input', {
                className: 'dem-sourceInput', type: 'url', value: draft, autoFocus: true,
                placeholder: t('indexAddPlaceholder'), 'aria-label': t('indexManage'),
                onChange: (event) => { setDraft(event.target.value); setError('') },
              }),
              h('button', { type: 'submit', className: 'dem-action', disabled: busy || draft.trim() === '' }, t('indexAdd')))
            : h('button', {
              type: 'button', className: 'dem-menuItem dem-menuManage',
              onClick: () => { setEditing(true); setError('') },
            }, h(IconPlus, { size: 12 }), t('indexManage')),
          error === '' ? null : h('p', { className: 'dem-menuError', role: 'alert' }, error)) : null)
    }

    /**
     * The filter bar: one inline row, always showing heat and publish age, with
     * stars and install state folded behind a disclosure so the row stays short.
     */
    function FilterBar({ filter, t, onChange }) {
      const [expanded, setExpanded] = useState(false)
      const heat = {
        id: 'heat', label: t('filterHeat'), value: filter.heat,
        options: [
          { id: 'any', label: t('filterAny') }, { id: '10', label: t('heat10') },
          { id: '100', label: t('heat100') }, { id: '1000', label: t('heat1k') },
        ],
      }
      const age = {
        id: 'age', label: t('filterAge'), value: filter.age,
        options: [
          { id: 'any', label: t('filterAny') }, { id: '7', label: t('age7') },
          { id: '30', label: t('age30') }, { id: '90', label: t('age90') },
        ],
      }
      const stars = {
        id: 'stars', label: t('filterStars'), value: filter.stars,
        options: [
          { id: 'any', label: t('filterAny') }, { id: '10', label: t('stars10') },
          { id: '100', label: t('stars100') }, { id: '1000', label: t('stars1k') },
        ],
      }
      const installed = {
        id: 'installed', label: t('filterInstalled'), value: filter.installed,
        options: [
          { id: 'any', label: t('filterAny') }, { id: 'yes', label: t('installedOnly') },
          { id: 'no', label: t('notInstalled') },
        ],
      }
      const row = (group) => {
        const chips = group.options.map(option => h(Pill, {
          key: option.id,
          active: group.value === option.id,
          onClick: () => { onChange({ ...filter, [group.id]: option.id }) },
        }, option.label))
        return h('div', { key: group.id, className: 'dem-filterGroup' },
          h('span', { className: 'dem-filterLabel' }, group.label),
          h('div', { className: 'dem-filterChips' }, ...chips))
      }
      const folded = [filter.stars, filter.installed].filter(value => value !== 'any').length
      const active = activeFilters(filter)
      const moreLabel = expanded ? t('filterLess') : (folded === 0 ? t('filterMore') : fill(t('filterMoreCount'), { count: folded }))
      return h('div', { className: 'dem-filters', role: 'group', 'aria-label': t('filter') },
        row(heat),
        row(age),
        expanded ? row(stars) : null,
        expanded ? row(installed) : null,
        h('div', { className: 'dem-filterTail' },
          h('button', {
            type: 'button', className: 'dem-filterMore', 'aria-expanded': expanded,
            onClick: () => { setExpanded(value => !value) },
          }, moreLabel),
          active === 0 ? null : h('button', {
            type: 'button', className: 'dem-filterReset',
            onClick: () => { onChange({ heat: 'any', stars: 'any', age: 'any', installed: 'any' }) },
          }, t('filterReset'))))
    }

    /** The 1-based page that an offset belongs to. */
    function pageOf(offset) {
      return Math.floor((offset ?? 0) / PAGE_SIZE) + 1
    }

    /** How many pages a result count fills, at least one. */
    function pageCount(total) {
      return Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))
    }

    /** Previous / page number / next paging control. */
    function Pager({ page, pages, busy, t, onPage }) {
      const window = new Set([1, pages])
      for (let offset = -1; offset <= 1; offset += 1) {
        const candidate = page + offset
        if (candidate >= 1 && candidate <= pages) window.add(candidate)
      }
      const numbers = [...window].sort((a, b) => a - b)
      const parts = []
      let previous = 0
      for (const number of numbers) {
        if (previous !== 0 && number - previous > 1) parts.push({ gap: `${previous + 1}-${number - 1}` })
        parts.push({ page: number })
        previous = number
      }
      const backArrow = h('span', { className: 'dem-pageArrow', 'aria-hidden': true }, h(IconChevronRight, { size: 12 }))
      const nextArrow = h('span', { className: 'dem-pageArrow dem-pageArrowNext', 'aria-hidden': true }, h(IconChevronRight, { size: 12 }))
      const numbers1 = parts.map((part) => {
        if (part.gap !== undefined) {
          return h('span', { key: `gap-${part.gap}`, className: 'dem-pageGap', 'aria-hidden': true }, '…')
        }
        return h('button', {
          key: `p-${part.page}`, type: 'button', disabled: busy,
          className: cls('dem-pageNumber', part.page === page && 'dem-pageNumberActive'),
          'aria-current': part.page === page ? 'page' : undefined,
          onClick: () => { if (part.page !== page) onPage(part.page) },
        }, String(part.page))
      })
      return h('nav', { className: 'dem-pager', 'aria-label': t('pagerLabel') },
        h('button', {
          type: 'button', className: 'dem-pageStep', disabled: page <= 1 || busy,
          onClick: () => { onPage(page - 1) },
        }, backArrow, t('pagePrev')),
        h('div', { className: 'dem-pageNumbers' }, ...numbers1),
        h('span', { className: 'dem-pageStatus', role: 'status', 'aria-live': 'polite' },
          fill(t('pageOf'), { page, pages })),
        h('button', {
          type: 'button', className: 'dem-pageStep', disabled: page >= pages || busy,
          onClick: () => { onPage(page + 1) },
        }, t('pageNext'), nextArrow))
    }

    /**
     * The installed view: one row per plugin already in this profile, with its state
     * and the actions that change it. The rows reuse the market's surface language —
     * the same card frame, the same category badge, the same glow on the active row —
     * so switching tabs does not feel like entering another application.
     */
    function InstalledView({ installed, t, language, nameOf, onToggle, onRemove, onBrowse, onOpen, onCheck, onUpdateAll, onUpdate, onDismissBatch }) {
      const [confirming, setConfirming] = useState('')
      const rows = installed.rows
      const busy = installed.busy
      const updateCount = Object.keys(installed.updates).length
      const batch = installed.batch

      if (installed.status === 'loading' && rows.length === 0) {
        return h('div', { className: 'dem-installed', role: 'status', 'aria-busy': 'true', 'aria-label': t('installedLoading') },
          ...Array.from({ length: 6 }, (_, index) => h('div', { key: index, className: 'dem-installedRow dem-skeleton', 'aria-hidden': true },
            h('div', { className: 'dem-skeletonIcon' }),
            h('div', { className: 'dem-installedMain' },
              h('div', { className: 'dem-skeletonBar', style: { width: '46%' } }),
              h('div', { className: 'dem-skeletonBar', style: { width: '70%' } })))))
      }
      if (installed.status === 'error') {
        return h('div', { className: 'dem-empty' },
          h('p', { className: 'dem-emptyTitle' }, installed.reason === 'unsupported' ? t('installedUnsupported') : t('installedFailed')),
          h('p', { className: 'dem-muted' }, installed.reason === 'unsupported' ? '' : installed.reason))
      }
      if (rows.length === 0) {
        return h('div', { className: 'dem-empty' },
          h('p', { className: 'dem-emptyTitle' }, t('installedEmpty')),
          h('p', { className: 'dem-muted' }, t('installedEmptyHint')),
          h('button', { type: 'button', className: 'dem-action', onClick: onBrowse }, t('backToMarket')))
      }

      const batchLine = batch === null ? null
        : batch.finished === true
          ? (batch.failed.length === 0
            ? fill(t('updateDone'), { ok: batch.succeeded })
            : fill(t('updatePartial'), { ok: batch.succeeded, bad: batch.failed.length }))
          : fill(t('updating'), { done: batch.done, total: batch.total, name: batch.current })

      return h('div', { className: 'dem-installed' },
        h('div', { className: 'dem-installedHead' },
          h('h2', { className: 'dem-installedTitle' }, t('installedTitle')),
          h('span', { className: 'dem-count' }, fill(t('installedCount'), { count: rows.length })),
          h('span', { className: 'dem-hotHint' }, t('installedHint')),
          h('div', { className: 'dem-installedTools' },
            updateCount === 0 ? null : h('button', {
              type: 'button', className: 'dem-action dem-actionAccent',
              disabled: batch !== null && batch.finished !== true,
              onClick: onUpdateAll,
            }, fill(t('updateAll'), { count: updateCount })),
            h('button', {
              type: 'button', className: 'dem-action dem-actionOutline',
              disabled: installed.checking === true,
              onClick: onCheck,
            }, installed.checking === true ? t('updateChecking') : t('updateCheck')))),
        batchLine === null ? null : h('div', {
          className: cls('dem-batch', batch.finished === true && batch.failed.length > 0 && 'dem-batchWarn'),
          role: 'status', 'aria-live': 'polite',
        },
          h('span', null, batchLine),
          batch.finished === true && batch.failed.length > 0
            ? h('ul', { className: 'dem-batchFailures' },
              ...batch.failed.map(failure => h('li', { key: failure.name },
                fill(t('updateFailedRow'), { name: failure.name, reason: failure.reason }))))
            : null,
          batch.finished === true
            ? h('button', { type: 'button', className: 'dem-filterReset', onClick: onDismissBatch }, t('updateDismiss'))
            : null),
        installed.checked === true && updateCount === 0 && installed.checking !== true
          ? h('p', { className: 'dem-muted dem-installedNoteLine' }, t('updateNone'))
          : null,
        ...(() => {
          // Four bands, in the order a reader cares about: what needs doing, what is
          // running, what is stopped, and what ships with DSH.
          const groups = [
            { id: 'update', label: t('groupUpdate'), rows: rows.filter(row => installed.updates[row.name] !== undefined) },
            { id: 'on', label: t('groupOn'), rows: rows.filter(row => installed.updates[row.name] === undefined && !row.shipped && row.enabled) },
            { id: 'off', label: t('groupOff'), rows: rows.filter(row => installed.updates[row.name] === undefined && !row.shipped && !row.enabled) },
            { id: 'shipped', label: t('groupShipped'), rows: rows.filter(row => row.shipped) },
          ].filter(group => group.rows.length > 0)
          return groups.map(group => h('section', { key: group.id, className: 'dem-installedGroup', 'data-group': group.id },
            h('div', { className: 'dem-installedGroupHead' },
              h('h3', { className: 'dem-installedGroupTitle' }, group.label),
              h('span', { className: 'dem-count' }, String(group.rows.length))),
            h('div', { className: 'dem-installedList' },
              ...group.rows.map((row) => {
            const working = busy === row.name
            const failed = installed.failureName === row.name && installed.failure !== ''
            const confirmingRow = confirming === row.name
            const update = installed.updates[row.name]
            // The origin badge already says where it came from, so this one always
            // answers the separate question: is it running right now?
            const state = row.enabled ? t('stateEnabled') : t('stateDisabled')
            // Three independent facts, three visual channels: a badge for where the
            // plugin came from, a rail for whether it runs, a badge for an update.
            // The rail is the running state, in every band: green running, grey
            // stopped, and a dim blue for a bundle DSH provides while it runs.
            const rail = row.enabled
              ? (row.shipped ? 'dem-installedRailShipped' : 'dem-installedRailOn')
              : 'dem-installedRailOff'
            return h('div', {
              key: row.name,
              className: cls('dem-installedRow', row.enabled && 'dem-installedRowOn'),
              'data-installed': row.name,
            },
              h('span', { className: cls('dem-installedRail', rail), 'aria-hidden': true }),
              h('button', {
                type: 'button', className: 'dem-installedOpen',
                onClick: () => { onOpen(row.name) },
                title: t('detailOf'),
              },
                h(MarketIcon, { entry: { name: row.name, icon: undefined, metadata: { category: '' } }, size: 36 }),
                h('div', { className: 'dem-installedMain' },
                  h('div', { className: 'dem-installedNameRow' },
                    h('span', { className: 'dem-installedName' }, nameOf({ name: row.name, title: row.title }, language)),
                    row.version === '' ? null : h('span', { className: 'dem-installedVersion' }, row.version),
                    h('span', { className: cls('dem-chip', row.shipped ? 'dem-chipOrigin' : 'dem-chipOriginParty') },
                      row.shipped ? t('originShipped') : t('originThirdParty')),
                    h('span', {
                      className: cls('dem-installedState', row.enabled ? 'dem-installedStateOn' : 'dem-installedStateOff'),
                    }, state),
                    update === undefined ? null : h('span', { className: 'dem-chip dem-chipUpdate' },
                      fill(t('updateAvailable'), { version: update.version }))),
                  h('span', { className: 'dem-installedPkg' }, row.name),
                  failed ? h('span', { className: 'dem-installedError', role: 'alert' },
                    fill(t('rowError'), { reason: installed.failure })) : null)),
              h('div', { className: 'dem-installedActions' },
                update === undefined ? null : h('button', {
                  key: 'up', type: 'button', className: 'dem-action dem-actionAccent', disabled: working,
                  onClick: () => { onUpdate(row.name, update) },
                }, working ? t('actionWorking') : fill(t('updateTo'), { version: update.version })),
                confirmingRow
                  ? [h('button', { key: 'ok', type: 'button', className: 'dem-action dem-actionDanger', disabled: working,
                    onClick: () => { setConfirming(''); onRemove(row.name) } }, t('actionConfirmRemove')),
                    h('button', { key: 'no', type: 'button', className: 'dem-action dem-actionOutline', disabled: working,
                      onClick: () => { setConfirming('') } }, t('actionCancel'))]
                  : [
                    h('button', {
                      key: 'toggle', type: 'button', role: 'switch', 'aria-checked': row.enabled,
                      className: cls('dem-action', !row.enabled && 'dem-actionOutline'),
                      disabled: working || row.readOnlyReason !== '',
                      title: row.readOnlyReason === '' ? undefined : row.readOnlyReason,
                      onClick: () => { onToggle(row.name, !row.enabled) },
                    }, working ? t('actionWorking') : (row.enabled ? t('actionDisable') : t('actionEnable'))),
                    row.removable
                      ? h('button', { key: 'rm', type: 'button', className: 'dem-action dem-actionGhost', disabled: working,
                        onClick: () => { setConfirming(row.name) } }, t('actionRemove'))
                      : h('span', { key: 'ships', className: 'dem-installedNote', title: t('shippedHint') }, t('shippedHint')),
                  ]))
              }))))
        })())
    }

    /** The page for one installed plugin: its facts and its own document. */
    function InstalledDetail({ installed, t, onBack, onRetry }) {
      const row = installed.rows.find(item => item.name === installed.opened)
      if (row === undefined) return null
      const document = installed.document
      const body = document === null || document === undefined || document.status === 'loading'
        ? h('p', { className: 'dem-docNote' }, t('detailLoading'))
        : document.status === 'error'
          ? h('div', { className: 'dem-docNote' },
            h('span', null, `${t('installedDocFailed')}${document.reason === '' ? '' : `：${document.reason}`}`),
            h('button', { type: 'button', className: 'dem-action dem-actionOutline', onClick: onRetry }, t('retry')))
          : document.status === 'none'
            ? h('p', { className: 'dem-docNote' }, t('installedDocMissing'))
            : h(Markdown, { text: document.markdown })
      return h('div', { className: 'dem-detail' },
        h('button', { type: 'button', className: 'dem-crumb', onClick: onBack, 'aria-label': t('backToInstalled'), title: t('backToInstalled') },
          h('span', { className: 'dem-crumbArrow', 'aria-hidden': true }, h(IconChevronRight, { size: 13 })),
          h('span', null, t('backToInstalled'))),
        h('header', { className: 'dem-detailHead' },
          h(MarketIcon, { entry: { name: row.name, icon: undefined, metadata: { category: '' } }, size: DETAIL_ICON }),
          h('div', { className: 'dem-detailIdentity' },
            h('h2', { className: 'dem-detailTitle' }, row.title),
            h('p', { className: 'dem-detailByline' },
              h('span', null, row.name),
              h('span', { className: 'dem-sep' }, '·'),
              h('span', null, row.shipped ? t('originShipped') : (row.enabled ? t('stateEnabled') : t('stateDisabled')))),
            h('dl', { className: 'dem-facets' },
              h('div', null, h('dt', null, row.version === '' ? '—' : row.version), h('dd', null, t('colVersion'))),
              h('div', null, h('dt', null, row.shipped ? t('originShipped') : t('originThirdParty')), h('dd', null, t('colCategory'))),
              h('div', null,
                h('dt', null, row.enabled ? t('stateEnabled') : t('stateDisabled')),
                h('dd', null, t('colState')))))),
        h('section', { className: 'dem-detailSection' },
          h('h3', { className: 'dem-sectionTitle' }, t('whatItDoes')),
          body))
    }



    /** An empty or failure state with an optional action. */
    function Empty({ title, description, action }) {
      return h('div', { className: 'dem-empty' },
        h('p', { className: 'dem-emptyTitle' }, title),
        description === undefined || description === title ? null : h('p', { className: 'dem-muted' }, description),
        action ?? null)
    }

    /** A first-load skeleton of hero cards and grid cards. */
    function Skeleton({ label }) {
      // The placeholder mirrors what is coming: the category row, then the grid. A
      // skeleton that does not match the final layout makes the page jump when the
      // index lands, which reads as slowness even when it is not.
      const bar = (key, width) => h('div', { key, className: 'dem-skeletonBar', style: { width } })
      const heroCard = (index) => h('div', {
        key: `hc-${index}`, className: 'dem-heroCard dem-skeleton', 'aria-hidden': true,
      },
        h('div', { className: 'dem-skeletonCover' }),
        h('div', { className: 'dem-heroBody' },
          bar('a', '52%'),
          bar('b', '78%'),
          bar('c', '64%')))
      const card = (index) => h('div', {
        key: `c-${index}`, className: 'dem-card dem-skeleton', 'aria-hidden': true,
      },
        h('div', { className: 'dem-cardHead' },
          h('div', { className: 'dem-skeletonIcon' }),
          h('div', { className: 'dem-cardTitleWrap' }, bar('d', '70%'), bar('e', '45%'))),
        bar('f', '92%'),
        bar('g', '76%'))
      const heroes = Array.from({ length: 6 }, (_, index) => heroCard(index))
      const cards = Array.from({ length: 8 }, (_, index) => card(index))
      return h('div', {
        className: 'dem-browse', role: 'status', 'aria-busy': 'true', 'aria-label': label,
      },
        h('div', { className: 'dem-heroCards' }, ...heroes),
        h('div', { className: 'dem-grid' }, ...cards))
    }

    // ---------------------------------------------------------------- options

    /** The sort menu entries for the current listing, with the index-provided sort keys. */
    function sortOptions(listing, query, t, language) {
      const options = [{ id: 'index', label: t('sortIndex'), sort: { kind: 'index' } }]
      const keys = listing?.metadata?.sortKeys ?? {}
      for (const [id, declaration] of Object.entries(keys)) {
        if (!/star|download|install|use|popular|recommend/i.test(id)) continue
        options.push({
          id, label: textOf(declaration?.title, language) || id,
          sort: { kind: 'key', id, direction: declaration?.order === 'asc' ? 'asc' : 'desc' },
        })
        if (options.length >= 3) break
      }
      options.push({ id: 'published', label: t('sortPublished'), sort: { kind: 'published', direction: 'desc' } })
      if (query.text.trim() !== '') options.unshift({ id: 'relevance', label: t('sortRelevance'), sort: { kind: 'relevance' } })
      return options
    }

    /** The popularity figure one entry publishes, or 0 when it publishes none. */
    function heatOf(entry) {
      const keys = entry.metadata?.sortKeys
      if (keys === null || keys === undefined || typeof keys !== 'object') return 0
      for (const [key, value] of Object.entries(keys)) {
        if (typeof value === 'number' && /star|download|install|use|popular|recommend/i.test(key)) return value
      }
      return 0
    }

    /** The star figure one entry publishes, or 0 when it publishes none. */
    function starsOfEntry(entry) {
      const keys = entry.metadata?.sortKeys
      const direct = keys?.['github-stars']
      if (typeof direct === 'number') return direct
      if (keys === null || keys === undefined || typeof keys !== 'object') return 0
      for (const [key, value] of Object.entries(keys)) {
        if (typeof value === 'number' && /star/i.test(key)) return value
      }
      return 0
    }

    /** Whether one entry passes every selected filter. */
    function passes(entry, filter, now) {
      const age = filter.age === 'any' ? 0 : Number(filter.age)
      if (age > 0) {
        const published = Number(entry.versions?.[0]?.publishTimestamp ?? 0) * 1000
        if (published === 0 || now - published > age * 24 * 60 * 60 * 1000) return false
      }
      const heatFloor = filter.heat === 'any' ? 0 : Number(filter.heat)
      if (heatFloor > 0 && heatOf(entry) < heatFloor) return false
      const starFloor = filter.stars === 'any' ? 0 : Number(filter.stars)
      if (starFloor > 0 && starsOfEntry(entry) < starFloor) return false
      const status = entry.installation?.status ?? 'not-installed'
      if (filter.installed === 'yes' && status === 'not-installed') return false
      if (filter.installed === 'no' && status !== 'not-installed') return false
      return true
    }

    /** How many filters are active, for the toolbar's own badge. */
    function activeFilters(filter) {
      return Object.values(filter).filter(value => value !== 'any').length
    }

    /** The sort id a query selects, matching `sortOptions`. */
    function sortIdOf(sort) {
      return sort.kind === 'key' ? sort.id : sort.kind
    }

    /** The category pills of a listing, in display order. */
    function categoryOptions(listing, language) {
      const categories = listing?.metadata?.categories ?? {}
      return Object.entries(categories)
        .map(([id, declaration]) => ({ id, title: textOf(declaration?.title, language) || id }))
        .sort((a, b) => a.title.localeCompare(b.title, language))
    }

    /** The display label of one index source. */
    function indexLabel(index, language) {
      if (index === undefined) return ''
      if (index.title !== undefined) return textOf(index.title, language) || index.url
      try { return new URL(index.url).host } catch (error) { return index.url ?? '' }
    }

    // ---------------------------------------------------------------- hooks

    /** The active locale id, re-rendering on a language change. */
    function useLocaleSnapshot(ctx) {
      const store = useMemo(() => {
        const inner = createStore(snapshotOf(ctx))
        return {
          get: inner.get,
          subscribe(listener) {
            const off = ctx.locale.subscribe(() => { inner.set(snapshotOf(ctx)) })
            const unsubscribe = inner.subscribe(listener)
            return () => { off(); unsubscribe() }
          },
        }
      }, [ctx])
      return useSyncExternalStore(store.subscribe, store.get, store.get)
    }

    /** Read the active locale id from the locale service without throwing. */
    function snapshotOf(ctx) {
      try { return ctx.locale.getLocale().active ?? 'en' } catch (error) { return 'en' }
    }

    // ---------------------------------------------------------------- sidebar icon

    /** The sidebar panel icon: a small expert-shelf glyph. */
    function PanelIcon(props) {
      const size = typeof props?.size === 'number' ? props.size : 18
      return h('svg', {
        viewBox: '0 0 20 20', width: size, height: size, fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
        h('path', { d: 'M3 4.6h5.2v10.8H3z' }),
        h('path', { d: 'M11.8 4.6H17v10.8h-5.2z' }),
        h('path', { d: 'M3 8.4h5.2M11.8 8.4H17' }),
        h('path', { d: 'M3 12.2h5.2M11.8 12.2H17' }))
    }
    // ---------------------------------------------------------------- styles

    /** Every rule of the page, scoped under the page root; theme tokens only. */
    const STYLE_ID = 'dem-expert-market-css'

    const CSS = `
.dem-root {
  --dem-page-inset: clamp(20px, 3.4vw, 48px);
  --dem-gap: 16px;
  --dem-radius: 18px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
  container-type: inline-size;
  position: relative;
}
/* Inside the Plugins page tab the surrounding panel already scrolls and already shows
   the page title, so the root gives up its own height and the inner scroll goes away. */
.dem-root[data-surface='tab'] { height: auto; min-height: 0; }
.dem-root[data-surface='tab'] .dem-scroll {
  overflow: visible; height: auto;
  padding: 16px 0 8px;
  scrollbar-gutter: auto;
}
.dem-scroll {
  flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
  padding: calc(28px + var(--dsh-frame-top-clearance, 0px)) var(--dem-page-inset) 64px;
  scrollbar-gutter: stable;
}
.dem-head { max-width: 1240px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; width: 100%; }
.dem-headTop { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px 24px; flex-wrap: wrap; }
.dem-headText { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.dem-title { margin: 0; font-size: 22px; line-height: 30px; font-weight: 600; letter-spacing: -0.01em; }
.dem-subtitle { margin: 0; max-width: 62ch; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary); }
.dem-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dem-search {
  display: flex; align-items: center; gap: 8px;
  min-width: 240px; height: 34px; padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-tertiary);
}
.dem-searchInput {
  flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px;
}
.dem-search:focus-within { border-color: var(--dsw-alias-state-business-primary); }
.dem-menuWrap { position: relative; }
.dem-menu {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 40;
  width: 320px; max-width: calc(100vw - 48px); padding: 6px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2); box-shadow: var(--dsw-shadow-lv3);
  display: flex; flex-direction: column; gap: 2px;
}
.dem-sourceList { display: flex; flex-direction: column; gap: 1px; }
.dem-sourceRow { display: flex; align-items: center; gap: 2px; border-radius: 8px; }
.dem-sourceRow:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dem-sourceRow .dem-menuItem { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 6px; }
.dem-sourceRow .dem-menuItem:hover:not(:disabled) { background: transparent; }
.dem-sourceName { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dem-sourceBad { flex: none; font-size: 10.5px; color: var(--dsw-alias-state-error-primary); }
.dem-sourceRemove {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; margin-right: 4px; padding: 0;
  border: 0; border-radius: 999px; background: transparent;
  color: var(--dsw-alias-label-tertiary); cursor: pointer; opacity: 0;
}
.dem-sourceRow:hover .dem-sourceRemove, .dem-sourceRemove:focus-visible { opacity: 1; }
.dem-sourceRemove:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-state-error-primary); }
.dem-menuSep { height: 0; margin: 4px 2px; border-top: 1px solid var(--dsw-alias-border-l1); }
.dem-menuEmpty { margin: 0; padding: 8px 10px; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.dem-menuError { margin: 2px 2px 0; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-state-error-primary); }
.dem-sourceForm { display: flex; align-items: center; gap: 6px; padding: 2px; }
.dem-sourceInput {
  flex: 1; min-width: 0; height: 28px; padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 12px;
}
.dem-sourceInput:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color); outline-offset: 1px; }
.dem-menuItem {
  position: relative;
  padding: 7px 10px; border: 0; border-radius: 8px; background: transparent; text-align: left;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-menuItem:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-menuItem:disabled { opacity: 0.45; cursor: not-allowed; }
/* The selected source gets a tinted row, a left bar and a labelled tick: a menu you
   scan in a second cannot rely on a font-weight change alone. */
.dem-menuItemActive {
  color: var(--dsw-alias-label-primary); font-weight: 600;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}
.dem-menuItemActive::before {
  content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--dsw-alias-brand-primary);
}
.dem-sourceCurrent {
  display: inline-flex; flex: none; align-items: center; gap: 4px;
  margin-left: 8px; color: var(--dsw-alias-brand-primary);
}
.dem-sourceCurrentText { font-size: 11px; font-weight: 500; }
.dem-sourceCurrent svg { flex: none; }
.dem-menuItemBroken { color: var(--dsw-alias-label-tertiary); }
.dem-menuName { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dem-ghost {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px;
  border: 1px solid transparent; border-radius: 999px; background: transparent;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer;
}
.dem-ghost:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-ghost:disabled { opacity: 0.5; cursor: default; }
.dem-iconButton {
  flex: none; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; padding: 0;
  border: 1px solid transparent; border-radius: 999px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dem-iconButton:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-iconButton:disabled { opacity: 0.4; cursor: default; }
.dem-ghost:focus-visible, .dem-action:focus-visible, .dem-pill:focus-visible, .dem-secondary:focus-visible,
.dem-primary:focus-visible, .dem-cardTitle:focus-visible, .dem-heroCover:focus-visible, .dem-heroLink:focus-visible,
.dem-iconButton:focus-visible, .dem-crumb:focus-visible, .dem-searchInput:focus-visible,
.dem-heroTitleButton:focus-visible, .dem-pageStep:focus-visible, .dem-pageNumber:focus-visible,
.dem-filterMore:focus-visible, .dem-filterReset:focus-visible, .dem-hotName:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
}

/* ── category cards ─────────────────────────────────────────────────────── */
.dem-browse { max-width: 1240px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; width: 100%; }
.dem-browseBusy { opacity: 0.55; transition: opacity 160ms ease; }
.dem-browseBusy .dem-grid, .dem-browseBusy .dem-hotList { pointer-events: none; }
.dem-divider { height: 0; margin: 2px 0; border: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.dem-emptyActions { display: flex; gap: 8px; margin-top: 4px; }

.dem-heroSection { display: flex; flex-direction: column; gap: 10px; }
.dem-heroCards { display: grid; gap: 15px; grid-template-columns: repeat(6, minmax(0, 1fr)); }
@container (max-width: 1180px) { .dem-heroCards { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@container (max-width: 760px) { .dem-heroCards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 480px) { .dem-heroCards { grid-template-columns: 1fr; } }

/* Surface: a wash of the category's own colour behind the top of the card over the
   raised page layer, fading to the page tone at the foot. A brand-coloured hairline
   sits on the top edge, and the edge itself lights up on hover. */
.dem-heroCard {
  --dem-hero-accent: var(--dsw-alias-brand-primary);
  --dem-hero-deep: var(--dsw-alias-brand-primary);
  --dem-hero-wash: var(--dsw-alias-brand-primary);
  position: relative;
  display: flex; flex-direction: column; min-width: 0;
  padding: 18px 16px 15px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1);
  background-image:
    radial-gradient(180px 120px at 22% 0%,
      color-mix(in srgb, var(--dem-hero-wash) 9%, transparent), transparent 72%),
    linear-gradient(180deg,
      color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, var(--dsw-alias-label-primary) 12%) 0%,
      var(--dsw-alias-bg-layer-1) 62%,
      var(--dsw-alias-bg-base) 100%);
  box-shadow:
    /* outer halo in the category colour, plus the page's own lift */
    0 0 0 1px color-mix(in srgb, var(--dem-hero-accent) 22%, transparent),
    0 6px 22px color-mix(in srgb, var(--dem-hero-deep) 18%, transparent),
    var(--dsw-shadow-lv1),
    /* inner rim so the edge reads as lit glass rather than a drawn line */
    inset 0 0 0 1px color-mix(in srgb, var(--dem-hero-accent) 12%, transparent),
    inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent);
  border-color: color-mix(in srgb, var(--dem-hero-accent) 20%, var(--dsw-alias-border-l1));
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}
/* A hairline of the category's colour across the top edge, faded at both ends: the
   brightest part of the lit frame. */
.dem-heroCard::before {
  content: ''; position: absolute; z-index: 3; top: 0; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--dem-hero-accent), transparent);
  opacity: 0.7;
  transition: opacity 220ms ease;
}
@media (hover: hover) {
  .dem-heroCard:hover::before { opacity: 1; }
}
@media (hover: hover) {
  .dem-heroCard:hover {
    border-color: color-mix(in srgb, var(--dem-hero-accent) 55%, var(--dsw-alias-border-l2));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--dem-hero-accent) 42%, transparent),
      0 10px 30px color-mix(in srgb, var(--dem-hero-deep) 30%, transparent),
      0 0 34px color-mix(in srgb, var(--dem-hero-accent) 26%, transparent),
      var(--dsw-shadow-lv2),
      inset 0 0 0 1px color-mix(in srgb, var(--dem-hero-accent) 22%, transparent),
      inset 0 1px 0 color-mix(in srgb, #ffffff 12%, transparent);
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .dem-heroCard:hover { transform: translateY(-3px); }
}
/* Full-bleed artwork across the card top; the title sits over its own fade, the way
   the reference lays its tag on the picture. */
.dem-heroCover {
  position: relative;
  display: block; width: 100%; height: 132px; flex: none;
  padding: 0; border: 0; overflow: hidden;
  background: #12131a; cursor: pointer;
  border-radius: 17px 17px 0 0;
}
.dem-heroCover svg {
  display: block; width: 100%; height: 100%;
  transform: scale(1.01);
  transition: transform 420ms ease;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .dem-heroCard:hover .dem-heroCover svg { transform: scale(1.06); }
}
/* The title is part of the picture: white over the darkened foot of the artwork. */
.dem-heroTitle {
  position: absolute; left: 15px; right: 15px; bottom: 10px; z-index: 2;
  margin: 0; text-align: left;
  font-size: 17px; line-height: 22px; font-weight: 600; letter-spacing: 0.4px;
  color: #ffffff;
  text-shadow: 0 2px 10px color-mix(in srgb, #000000 65%, transparent);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* The SVG paints its own vignette; nothing else needs to tint the plate. */
.dem-cover { display: block; }
.dem-heroBody { display: flex; flex: 1; flex-direction: column; gap: 1px; }
.dem-heroLinks { display: flex; flex: 1; flex-direction: column; gap: 1px; margin: 0; padding: 0; list-style: none; }
.dem-heroLink {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; height: 34px; padding: 0;
  border: 0; background: none; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px;
  text-align: left; cursor: pointer;
}
.dem-heroLink:hover { color: var(--dsw-alias-label-primary); }
.dem-heroLinkText { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dem-heroLink svg { flex: none; opacity: 0.55; }
/* The foot closes the card: a hairline, a lit dot in the category's colour, then the
   count in emphasis. This is what makes the card read as finished. */
.dem-heroFoot {
  display: flex; align-items: center; gap: 8px;
  margin-top: auto; padding-top: 13px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  font-size: 12px; letter-spacing: 0.2px; color: var(--dsw-alias-label-tertiary);
}
.dem-heroFoot::before {
  content: ''; flex: none; width: 6px; height: 6px; border-radius: 999px;
  background: var(--dem-hero-accent);
  box-shadow: 0 0 10px var(--dem-hero-accent);
}
.dem-heroCount { color: var(--dsw-alias-label-secondary); font-weight: 600; font-variant-numeric: tabular-nums; }



/* ── view tabs ──────────────────────────────────────────────────────────── */
/* Two tabs under the title: the market catalogue, and what is already installed. */
.dem-tabs { display: flex; align-items: center; gap: 4px; }
.dem-tab {
  height: 30px; padding: 0 14px;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 13px; cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
@media (hover: hover) {
  .dem-tab:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
}
.dem-tabActive, .dem-tabActive:hover {
  border-color: var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary); font-weight: 600;
}
.dem-tab:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
}

/* ── installed list ─────────────────────────────────────────────────────── */
.dem-installed {
  max-width: 1240px; margin: 0 auto; width: 100%;
  display: flex; flex-direction: column; gap: 12px;
}
.dem-installedHead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.dem-installedTitle { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; }
.dem-installedList { display: flex; flex-direction: column; gap: 8px; }
/* A row borrows the category card's frame: the same radius, the same inset rim, and
   the category-colour glow only while the plugin is actually enabled. */
.dem-installedRow {
  display: flex; align-items: center; gap: 12px; min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: var(--dsw-alias-bg-layer-1);
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}
.dem-installedRowOn {
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 26%, var(--dsw-alias-border-l1));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent),
    0 4px 14px color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent),
    var(--dsw-shadow-lv1),
    inset 0 1px 0 color-mix(in srgb, #ffffff 7%, transparent);
}
@media (hover: hover) {
  .dem-installedRow:hover {
    border-color: var(--dsw-alias-border-l2);
    background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 60%, var(--dsw-alias-bg-layer-1));
  }
  .dem-installedRowOn:hover {
    border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--dsw-alias-border-l2));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-success-primary) 22%, transparent),
      0 6px 20px color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent),
      var(--dsw-shadow-lv2),
      inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
  }
}
.dem-installedMain { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }
.dem-installedNameRow { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; min-width: 0; }
.dem-installedName {
  min-width: 0; font-size: 14px; line-height: 20px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-installedPkg {
  font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-installedState {
  flex: none; padding: 0 7px; border-radius: 6px;
  font-size: 11px; line-height: 18px; font-weight: 500;
}
.dem-installedStateOn { background: var(--dsw-alias-state-success-tertiary); color: var(--dsw-alias-state-success-primary); }
.dem-installedStateOff { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-tertiary); }
.dem-installedStateShipped { background: var(--dsw-alias-state-business-tertiary); color: var(--dsw-alias-label-secondary); }
.dem-installedError {
  font-size: 11.5px; line-height: 17px; color: var(--dsw-alias-state-error-primary);
  overflow-wrap: anywhere;
}
.dem-installedActions { display: flex; flex: none; align-items: center; gap: 6px; }
.dem-installedNote { font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.dem-actionDanger {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent);
  color: var(--dsw-alias-state-error-primary);
}
@media (hover: hover) {
  .dem-actionDanger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 22%, transparent);
  }
}
@container (max-width: 760px) {
  .dem-installedRow { flex-wrap: wrap; }
  .dem-installedActions { width: 100%; justify-content: flex-end; }
}

/* ── tab count and installed groups ─────────────────────────────────────── */
.dem-tabCount {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 17px; height: 17px; margin-left: 6px; padding: 0 5px;
  border-radius: 999px; background: var(--dsw-alias-bg-layer-2);
  font-size: 10.5px; font-weight: 600; line-height: 1;
  font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary);
}
.dem-tabActive .dem-tabCount { background: var(--dsw-alias-state-business-tertiary); }
.dem-installedGroup { display: flex; flex-direction: column; gap: 8px; }
.dem-installedGroupHead { display: flex; align-items: baseline; gap: 8px; }
.dem-installedGroupTitle {
  margin: 0; font-size: 12.5px; line-height: 18px; font-weight: 600;
  letter-spacing: 0.3px; color: var(--dsw-alias-label-secondary);
}
/* An update band is the only warm heading, matching its rows' chip. */
.dem-installedGroup[data-group='update'] .dem-installedGroupTitle { color: var(--dsw-alias-state-warn-primary); }

/* ── installed rows: state, updates, and the plugin page ────────────────── */
.dem-installedTools { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.dem-installedNoteLine { margin: 0; }
/* A rail on the left edge is the running state: green when enabled, grey when
   stopped, blue when DSH itself provides it. It never encodes origin or updates. */
.dem-installedRail { flex: none; width: 3px; align-self: stretch; border-radius: 999px; }
.dem-installedRailOn { background: var(--dsw-alias-state-success-primary); box-shadow: 0 0 8px var(--dsw-alias-state-success-primary); }
.dem-installedRailOff { background: var(--dsw-alias-border-l3); }
.dem-installedRailShipped { background: var(--dsw-alias-state-business-primary); }
/* The row body is the click target for the plugin's page; the actions sit outside it. */
.dem-installedOpen {
  display: flex; flex: 1; align-items: center; gap: 12px; min-width: 0;
  padding: 0; border: 0; background: none; cursor: pointer; text-align: left; color: inherit;
}
.dem-installedOpen:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);
  outline-offset: 3px; border-radius: 8px;
}
.dem-installedVersion {
  flex: none; font-size: 11.5px; line-height: 18px; color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}
/* Origin always carries the same two words, so it reads as a category of plugin. */
.dem-chipOrigin { background: var(--dsw-alias-state-business-tertiary); color: var(--dsw-alias-label-secondary); }
.dem-chipOriginParty { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
/* An available update is the only warm chip on the page, so it draws the eye. */
.dem-chipUpdate { background: var(--dsw-alias-state-warn-tertiary); color: var(--dsw-alias-state-warn-primary); font-weight: 500; }
.dem-actionAccent {
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);
  color: var(--dsw-alias-state-warn-primary);
}
@media (hover: hover) {
  .dem-actionAccent:hover:not(:disabled) {
    background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 22%, transparent);
  }
}
/* Batch progress sits under the toolbar: one line while running, a summary after. */
.dem-batch {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 9px 12px; border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary);
}
.dem-batchWarn { background: var(--dsw-alias-state-warn-tertiary); color: var(--dsw-alias-label-primary); }
.dem-batchFailures { margin: 0; padding-left: 18px; width: 100%; }
.dem-batchFailures li { font-size: 11.5px; color: var(--dsw-alias-state-error-primary); overflow-wrap: anywhere; }

/* ── popular names ──────────────────────────────────────────────────────── */
.dem-hotSection { display: flex; flex-direction: column; gap: 0; }
.dem-hotHead { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 2px; }
.dem-hotTitle { margin: 0; font-size: 13.5px; line-height: 19px; font-weight: 600; }
.dem-hotHint { font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dem-hotList {
  margin: 0; padding: 0; list-style: none;
  display: grid; gap: 0 24px; grid-template-columns: repeat(4, minmax(0, 1fr));
}
@container (max-width: 1080px) { .dem-hotList { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 640px) { .dem-hotList { grid-template-columns: 1fr; } }
.dem-hotItem { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0; line-height: 18px; }
.dem-hotRank {
  flex: none; width: 15px; text-align: right;
  font-size: 11px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary);
}
.dem-hotName {
  flex: 1; min-width: 0; padding: 0; border: 0; background: none; text-align: left;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 18px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer;
}
.dem-hotName:hover { color: var(--dsw-alias-brand-primary); }
.dem-hotMeta {
  flex: none; max-width: 40%; font-size: 11px; color: var(--dsw-alias-label-tertiary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-hotSkeleton { opacity: 0.5; }

/* ── list head, filters, categories ─────────────────────────────────────── */
/* A quiet line above the grid: the list came from the browser's stored answer and a
   live read is on its way in. */
.dem-cacheNote {
  margin: 0; font-size: 11.5px; line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}
.dem-listHead { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.dem-listTitle { display: flex; align-items: baseline; gap: 8px; }
.dem-listTitle h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; }
.dem-count {
  padding: 1px 7px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2);
  font-size: 11.5px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums;
}
.dem-sorts, .dem-pills { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.dem-pills { padding-bottom: 2px; }
.dem-pills .dem-pill { height: 26px; font-size: 12px; }
.dem-pill {
  height: 28px; padding: 0 12px; border-radius: 999px; border: 1px solid transparent;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12.5px;
  white-space: nowrap; cursor: pointer;
}
.dem-pill:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-pillActive, .dem-pillActive:hover {
  border-color: var(--dsw-alias-border-l3); background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary); font-weight: 500;
}
/* One wrapped line of labelled chip groups. */
.dem-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin: 0; }
.dem-filterGroup { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.dem-filterLabel { font-size: 11px; line-height: 20px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.dem-filterChips { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; }
.dem-filterChips .dem-pill { height: 20px; padding: 0 7px; font-size: 11px; border-radius: 6px; }
.dem-filterTail { display: inline-flex; align-items: center; gap: 10px; margin-left: auto; }
.dem-filterMore {
  padding: 0; border: 0; background: none; cursor: pointer;
  font: inherit; font-size: 11px; line-height: 20px; color: var(--dsw-alias-label-secondary);
}
.dem-filterMore:hover { color: var(--dsw-alias-label-primary); }
.dem-filterReset {
  padding: 0; border: 0; background: none; cursor: pointer;
  font: inherit; font-size: 11px; line-height: 20px; color: var(--dsw-alias-label-tertiary);
  text-decoration: underline; text-underline-offset: 2px;
}
.dem-filterReset:hover { color: var(--dsw-alias-label-primary); }

/* ── plugin cards ───────────────────────────────────────────────────────── */
.dem-grid { display: grid; gap: var(--dem-gap); grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); }
.dem-card {
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  padding: 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dem-radius);
  background: var(--dsw-alias-bg-layer-1);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
@media (hover: hover) {
  .dem-card:hover { border-color: var(--dsw-alias-border-l3); box-shadow: var(--dsw-shadow-lv1); }
}
.dem-cardHead { display: flex; align-items: flex-start; gap: 10px; min-width: 0; cursor: pointer; }
.dem-cardTitleWrap { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.dem-cardTitle {
  padding: 0; border: 0; background: none; color: inherit; font: inherit;
  font-size: 14px; line-height: 20px; font-weight: 600; text-align: left; cursor: pointer;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-cardTitle:hover { color: var(--dsw-alias-brand-primary); }
.dem-cardMeta {
  font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-cardAction { flex: none; }
.dem-cardDesc {
  margin: 0; font-size: 12.5px; line-height: 19px; color: var(--dsw-alias-label-secondary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 38px;
}
.dem-chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 0; padding: 0; list-style: none; }
.dem-chip {
  padding: 1px 7px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2);
  font-size: 11.5px; line-height: 17px; color: var(--dsw-alias-label-secondary);
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-chipTone { background: var(--dsw-alias-state-business-tertiary); }
.dem-chipCategory {
  flex: none; border: 1px solid var(--dsw-alias-border-l1); background: transparent;
  color: var(--dsw-alias-label-secondary);
}
.dem-cardFoot {
  display: flex; align-items: center; gap: 10px; margin-top: 2px;
  font-size: 11.5px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums;
}
.dem-stat { display: inline-flex; align-items: center; gap: 3px; min-width: 0; }
.dem-author { margin-left: auto; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── artwork: a published icon, or the category's line mark on a tinted plate ── */
.dem-iconButtonlike { cursor: pointer; }
.dem-icon, .dem-iconFallback {
  flex: none; border-radius: 10px; object-fit: contain;
  box-sizing: border-box; padding: 3px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-layer-1);
}
.dem-icon { display: block; }
.dem-mark {
  display: inline-flex; flex: none; align-items: center; justify-content: center;
  box-sizing: border-box; border-radius: 11px;
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dem-mark-tone, var(--dsw-alias-label-secondary));
  transition: border-color 120ms ease, color 120ms ease;
}
@media (hover: hover) {
  .dem-iconButtonlike:hover.dem-mark { border-color: var(--dsw-alias-border-l3); }
}

/* ── buttons ────────────────────────────────────────────────────────────── */
.dem-action {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  height: 28px; padding: 0 12px; white-space: nowrap;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  font: inherit; font-size: 12.5px; font-weight: 500;
  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
@media (hover: hover) {
  .dem-action:hover:not(:disabled) {
    border-color: var(--dsw-alias-border-l3);
    background: var(--dsw-alias-interactive-bg-hover);
  }
}
.dem-action:active:not(:disabled) { background: var(--dsw-alias-interactive-bg-active); }
.dem-actionOutline { background: transparent; }
.dem-actionGhost { border-color: transparent; background: transparent; color: var(--dsw-alias-label-secondary); }
.dem-actionBlocked { opacity: 0.5; cursor: not-allowed; }
.dem-action:disabled { opacity: 0.55; cursor: default; }
.dem-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-success-primary); }
.dem-primary {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 20px;
  border: 0; border-radius: 999px; cursor: pointer; font: inherit; font-size: 13.5px; font-weight: 500;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
  transition: background-color 120ms ease;
}
.dem-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dem-primaryQuiet { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.dem-primaryQuiet:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dem-primary:disabled { opacity: 0.55; cursor: default; }
.dem-secondary {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; cursor: pointer;
}
.dem-secondary:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dem-secondary:disabled { opacity: 0.5; cursor: default; }

/* ── detail page ────────────────────────────────────────────────────────── */
.dem-detail { max-width: 940px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; width: 100%; }
.dem-crumb {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px 0 10px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
@media (hover: hover) {
  .dem-crumb:hover {
    border-color: var(--dsw-alias-border-l3);
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}
.dem-crumb:active { background: var(--dsw-alias-interactive-bg-active); }
.dem-crumbArrow { display: inline-flex; transform: rotate(180deg); }
.dem-detailHead { display: flex; align-items: flex-start; gap: 18px; flex-wrap: wrap; }
.dem-detailIdentity { flex: 1; min-width: 260px; display: flex; flex-direction: column; gap: 6px; }
.dem-detailTitle { margin: 0; font-size: 22px; line-height: 30px; font-weight: 600; letter-spacing: -0.01em; overflow-wrap: anywhere; }
.dem-detailByline {
  margin: 0; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-tertiary);
  display: flex; gap: 6px; flex-wrap: wrap;
}
.dem-sep { opacity: 0.6; }
.dem-detailIndex { min-width: 0; overflow-wrap: anywhere; }
.dem-detailButtons { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.dem-detailDesc { margin: 0; font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dem-detailTags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.dem-detailTags .dem-chip { font-size: 12.5px; line-height: 22px; padding: 0 10px; border-radius: 8px; }
.dem-facets {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; margin: 0;
  padding: 14px 0; border-block: 1px solid var(--dsw-alias-border-l1);
}
.dem-facets > div { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 12px; min-width: 0; }
.dem-facets > div + div { border-left: 1px solid var(--dsw-alias-border-l1); }
.dem-facets dt {
  margin: 0; max-width: 100%; font-size: 15px; line-height: 22px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-facets dd { margin: 0; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dem-facetWide { font-size: 14px; }
.dem-detailSection { display: flex; flex-direction: column; gap: 10px; }
.dem-sectionTitle { margin: 0; font-size: 14px; line-height: 20px; font-weight: 600; }
.dem-docNote {
  margin: 0; padding: 12px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2);
  font-size: 12.5px; line-height: 19px; color: var(--dsw-alias-label-tertiary);
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
}
.dem-facts { margin: 0; }
.dem-facts > div {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 8px 2px; border-bottom: 1px solid var(--dsw-alias-border-l1); min-height: 38px;
}
.dem-facts dt { flex: none; font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-tertiary); }
.dem-facts dd { margin: 0; min-width: 0; font-size: 12.5px; line-height: 20px; text-align: right; overflow-wrap: anywhere; }
.dem-facts dd code {
  padding: 1px 6px; border-radius: 5px; background: var(--dsw-alias-bg-layer-2);
  font-family: var(--ds-font-family-code); font-size: 11.5px;
}
.dem-factsCompact > div { min-height: 32px; padding: 5px 2px; }
.dem-link { color: var(--dsw-alias-link); text-decoration: none; overflow-wrap: anywhere; }
.dem-link:hover { text-decoration: underline; }

/* ── markdown ───────────────────────────────────────────────────────────── */
.dem-md { font-size: 13px; line-height: 21px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dem-md > :first-child { margin-top: 0; }
.dem-mdHead { margin: 18px 0 6px; font-size: 13.5px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dem-mdP { margin: 8px 0; }
.dem-mdList { margin: 8px 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
.dem-mdList li { list-style: disc; }
.dem-mdCode {
  margin: 10px 0; padding: 10px 12px; overflow-x: auto; border-radius: 10px;
  background: var(--dsw-alias-bg-module-platform);
  font-family: var(--ds-font-family-code); font-size: 11.5px; line-height: 18px;
}
.dem-mdQuote {
  margin: 10px 0; padding: 8px 12px; border-left: 3px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-tertiary);
}
.dem-mdInlineCode {
  padding: 1px 5px; border-radius: 5px; background: var(--dsw-alias-bg-layer-2);
  font-family: var(--ds-font-family-code); font-size: 11.5px;
}
.dem-mdRule { margin: 14px 0; border: 0; border-top: 1px solid var(--dsw-alias-border-l1); }

/* ── install dialog ─────────────────────────────────────────────────────── */
.dem-modalLayer {
  position: absolute; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: var(--dsw-alias-bg-mask-2);
}
.dem-modal {
  display: flex; flex-direction: column; width: min(520px, 100%); max-height: 100%; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: var(--dsw-alias-bg-layer-1); box-shadow: var(--dsw-shadow-lv3);
}
.dem-modalHead { display: flex; align-items: flex-start; gap: 12px; padding: 16px 16px 12px; }
.dem-modalIdentity { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
.dem-modalTitle {
  margin: 0; font-size: 14px; line-height: 20px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-modalMeta {
  margin: 0; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code); overflow-wrap: anywhere;
}
.dem-modalBody { display: flex; flex-direction: column; gap: 10px; padding: 0 16px 8px; overflow-y: auto; min-height: 0; }
.dem-phase { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; line-height: 20px; font-weight: 500; }
.dem-phase-confirm { color: var(--dsw-alias-label-primary); }
.dem-phase-done { color: var(--dsw-alias-state-success-primary); }
.dem-phase-failed { color: var(--dsw-alias-state-error-primary); }
.dem-spinner {
  width: 12px; height: 12px; border-radius: 999px;
  border: 1.6px solid var(--dsw-alias-border-l3); border-top-color: var(--dsw-alias-state-business-primary);
  animation: dem-spin 900ms linear infinite;
}
@keyframes dem-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .dem-spinner { animation: none; } }
.dem-log { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); }
.dem-log summary { padding: 8px 10px; font-size: 12px; color: var(--dsw-alias-label-secondary); cursor: pointer; list-style: none; }
.dem-log summary::-webkit-details-marker { display: none; }
.dem-logBody {
  margin: 0; padding: 0 10px 10px; max-height: 180px; overflow: auto;
  font-family: var(--ds-font-family-code); font-size: 11px; line-height: 17px;
  color: var(--dsw-alias-label-tertiary); white-space: pre-wrap; overflow-wrap: anywhere;
}
.dem-modalFoot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--dsw-alias-border-l1); }

/* ── notices, empty states, pager, skeleton ─────────────────────────────── */
.dem-muted { margin: 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary); }
.dem-error { margin: 0; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-state-error-primary); overflow-wrap: anywhere; }
.dem-notice {
  margin: 0; padding: 9px 11px; border-radius: 10px; font-size: 12px; line-height: 18px;
  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary);
  display: flex; flex-direction: column; gap: 6px; align-items: flex-start;
}
.dem-noticeWarn { background: var(--dsw-alias-state-warn-tertiary); color: var(--dsw-alias-label-primary); }
.dem-notice p { margin: 0; }
.dem-empty {
  max-width: 1240px; margin: 48px auto; padding: 40px 0;
  display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
}
.dem-emptyTitle { margin: 0; font-size: 15px; font-weight: 600; }

.dem-pager { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; padding: 6px 0 28px; }
.dem-pageStep {
  display: inline-flex; align-items: center; gap: 4px;
  height: 30px; padding: 0 12px; white-space: nowrap;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 12.5px; cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
@media (hover: hover) {
  .dem-pageStep:hover:not(:disabled) {
    border-color: var(--dsw-alias-border-l3);
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}
.dem-pageStep:disabled { opacity: 0.45; cursor: default; }
.dem-pageArrow { display: inline-flex; transform: rotate(180deg); }
.dem-pageArrowNext { transform: none; }
.dem-pageNumbers { display: inline-flex; align-items: center; gap: 2px; }
.dem-pageNumber {
  min-width: 30px; height: 30px; padding: 0 8px;
  border: 1px solid transparent; border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 12.5px; font-variant-numeric: tabular-nums; cursor: pointer;
}
.dem-pageNumber:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-pageNumberActive, .dem-pageNumberActive:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary); font-weight: 600;
}
.dem-pageNumber:disabled { opacity: 0.45; cursor: default; }
.dem-pageGap { padding: 0 2px; color: var(--dsw-alias-label-tertiary); }
.dem-pageStatus { font-size: 12px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }

/* The category skeleton's cover keeps the same height as a real cover, so the row
   does not collapse while the index loads. */
.dem-skeletonCover { height: 132px; background: var(--dsw-alias-bg-skeleton); border-radius: 17px 17px 0 0; }
.dem-skeletonBar { height: 10px; margin: 5px 0; border-radius: 999px; background: var(--dsw-alias-bg-skeleton); }
.dem-skeletonIcon { width: 40px; height: 40px; border-radius: 10px; background: var(--dsw-alias-bg-skeleton); flex: none; }

@container (max-width: 720px) {
  .dem-grid { grid-template-columns: 1fr; }
  .dem-facets { grid-template-columns: 1fr; }
  .dem-facets > div { flex-direction: row; align-items: baseline; justify-content: space-between; padding: 6px 0; }
  .dem-facets > div + div { border-left: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
  .dem-title { font-size: 19px; }
  .dem-detailTitle { font-size: 19px; }
}
`

    /** Install the page stylesheet once, owned by the plugin context. */
    function installStyles() {
      // A reload of this module may leave the previous tag behind; replacing it keeps
      // exactly one copy of the rules and hands the new disposal its own node.
      const previous = document.getElementById(STYLE_ID)
      if (previous !== null) previous.remove()
      const tag = document.createElement('style')
      tag.id = STYLE_ID
      tag.textContent = CSS
      document.head.appendChild(tag)
      return () => { tag.remove() }
    }

    // ---------------------------------------------------------------- plugin

    return {
      inject: ['slots', 'locale', 'layout', 'remote', 'remote.pluginMarket', 'remote.pluginManager', 'remoteAccess'],
      apply(ctx) {
        // The slot kit binds its own translate function to this entry's namespace;
        // same binding for its own controller (counts, toasts, dialog titles).
        const t = (key, values) => fill(ctx.locale.bind(NS)(key), values)
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'expert-market: dictionaries')
        ctx.effect(() => installStyles(), 'expert-market: styles')
        const controller = new MarketController(ctx, t)
        ctx.effect(() => () => { controller.dispose() }, 'expert-market: controller')

        // External invalidations: a changed index list or an installed bundle re-reads
        // the page.
        ctx.effect(() => {
          const offs = [
            ctx.remote.$on('plugin-market/changed', () => { controller.reload() }),
            ctx.remote.$on('plugin-manager/changed', () => { controller.reload() }),
            ctx.remote.$on('plugin-manager/install-state', frame => { controller.installState(frame) }),
            ctx.remote.$on('plugin-manager/install-log', chunk => { controller.appendLog(chunk) }),
          ]
          return () => { for (const off of offs) off() }
        }, 'expert-market: host invalidations')

        // Translation arrives from the slot kit because this entry declares a locale, so the
        // injection must not carry a second one: the renderer refuses duplicate props.
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PANEL_ID, locale: NS,
          inject: () => ({ controller }),
        }, MarketPage))

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 5,
          label: () => t('nav'), locale: NS,
        }, PanelIcon))

        // The same page, as a tab on the official Plugins page. `order: -2` sits it
        // before the shipped market tab (-1), which is where the reference puts it:
        // right after Installed, before Plugins market.
        ctx.slots.inject('plugins.tab', () => ctx.slots.register({
          name: 'plugins.tab', id: PANEL_ID, order: -2,
          label: () => t('nav'), locale: NS,
          inject: () => ({ controller, surface: 'tab' }),
        }, MarketPage))
      },
    }
  },
})
