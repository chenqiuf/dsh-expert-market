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
