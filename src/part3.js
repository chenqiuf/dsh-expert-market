
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
      // The installed list is local, so it paints first; the catalogue is warmed in the
      // background and is usually ready before the reader switches to it.
      useEffect(() => {
        controller.primeInstalled()
        controller.warmCatalogue()
      }, [])
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
                h('button', {
                  type: 'button', className: 'dem-ghost dem-ghostIcon', 'aria-label': t('refresh'),
                  disabled: state.status === 'loading',
                  onClick: () => { controller.reload() },
                }, h(IconRefresh, null)))),
            h('div', { className: 'dem-tabs', role: 'tablist', 'aria-label': t('title') },
              h('button', {
                type: 'button', role: 'tab', 'aria-selected': state.view === VIEW_INSTALLED,
                className: cls('dem-tab', state.view === VIEW_INSTALLED && 'dem-tabActive'),
                onClick: () => { setOpened(null); resetScroll(); controller.setView(VIEW_INSTALLED) },
              }, t('tabInstalled'),
              state.installed.status === 'ready' && state.installed.rows.length > 0
                ? h('span', { className: 'dem-tabCount' }, String(state.installed.rows.length))
                : null),
              // The catalogue tab is the promotion: it carries a badge of how much is
              // waiting and a warm tint, so the reader's eye lands on the door out of
              // the installed list rather than on the list they are already in.
              h('button', {
                type: 'button', role: 'tab', 'aria-selected': state.view === VIEW_MARKET,
                className: cls('dem-tab', 'dem-tabGo', state.view === VIEW_MARKET && 'dem-tabActive'),
                onClick: () => { setOpened(null); resetScroll(); controller.setView(VIEW_MARKET) },
              },
                h('span', { className: 'dem-tabGoText' }, t('tabMarket')),
                state.listing?.total > 0
                  ? h('span', { className: 'dem-tabGoCount' }, String(state.listing.total))
                  : null,
                h(IconChevronRight, { size: 12 }))),

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
