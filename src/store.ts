// Global reactive store: one yard sale per page, any layout.
// Config is set imperatively via configureYardSale(...) (exposed on window),
// so nothing rides through attributes or context. Search + day-filter state and
// the fetched records live here too, so every element reads one shared list.
//
// Singleton identity is load-bearing: ship a single bundle with one copy of
// solid-js and one copy of this module, or you get two stores that disagree.

import { createRoot, createSignal, createMemo, createResource } from 'solid-js'
import { createStore, reconcile, unwrap } from 'solid-js/store'
import { loadYardSales, extractSpreadsheetId } from './utils/sheets'
import {
  emptyConfig,
  mergeConfig,
  isCancelled,
  isDayVisible,
  matches,
  dayLabel,
  getDayKeys,
  type YardSaleConfig,
  type YardSaleConfigInput,
} from './utils/config'

const store = createRoot(() => {
  const [config, setConfig] = createStore<YardSaleConfig>(emptyConfig())
  const [query, setQuery] = createSignal('')
  // Day keys unchecked. Empty = nothing hidden = every day shown (default).
  const [deselectedDays, setDeselectedDays] = createSignal<string[]>([])

  const [raw] = createResource(
    () => {
      const id = config.spreadsheetId || extractSpreadsheetId(config.spreadsheetUrl)
      return id && config.apiKey ? { id, key: config.apiKey } : null
    },
    ({ id, key }) => loadYardSales(id, key),
  )

  // Records after cancellation + search, before the day toggles apply.
  const matched = createMemo(() =>
    (raw() ?? [])
      .filter(record => !isCancelled(record, config))
      .filter(record => matches(record, query(), config)),
  )

  // The event's days that actually appear in the matched records, chronological,
  // with display labels. So the pill list reflects the current search.
  const availableDays = createMemo(() => {
    const dates = config.eventDates
    const present = new Set<string>()
    for (const record of matched()) {
      for (const key of getDayKeys(record, config) ?? []) present.add(key)
    }
    return Object.keys(dates)
      .filter(key => dates[key] && present.has(key))
      .sort((a, b) => ((dates[a] ?? '') < (dates[b] ?? '') ? -1 : 1))
      .map(key => ({ key, label: dayLabel(dates[key] as string, config.timezone) }))
  })

  const records = createMemo(() => {
    const available = availableDays().map(day => day.key)
    // Ignore any deselection that isn't currently available (e.g. after a search).
    const deselected = deselectedDays().filter(key => available.includes(key))
    // Every available day unchecked = no narrowing, show everything.
    const active = deselected.length === available.length ? [] : deselected
    return matched().filter(record => isDayVisible(record, config, active))
  })

  return {
    config,
    setConfig,
    query,
    setQuery,
    deselectedDays,
    setDeselectedDays,
    availableDays,
    raw,
    records,
  }
})

export const { config, query, setQuery, deselectedDays, availableDays, raw, records } = store

export const isConfigured = () =>
  Boolean((config.spreadsheetId || config.spreadsheetUrl) && config.apiKey)

export function toggleDay(key: string): void {
  store.setDeselectedDays(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
  )
}

export function configureYardSale(input: YardSaleConfigInput): void {
  const merged = mergeConfig(unwrap(config), input)
  store.setConfig(reconcile(merged))
  if (typeof document !== 'undefined' && merged.accentColor) {
    document.documentElement.style.setProperty('--ys-accent', merged.accentColor)
  }
}
