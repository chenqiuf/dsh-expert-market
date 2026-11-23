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
  padding: 7px 10px; border: 0; border-radius: 8px; background: transparent; text-align: left;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dem-menuItem:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dem-menuItem:disabled { opacity: 0.45; cursor: not-allowed; }
.dem-menuItemActive { color: var(--dsw-alias-label-primary); font-weight: 500; }
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
