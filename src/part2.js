
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
