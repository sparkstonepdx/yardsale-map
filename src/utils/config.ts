// Config shape + pure resolution helpers.
//
// Layers kept separate on purpose:
//   columns      - which sheet header holds what
//   scheduleMap  - radio value -> stable day keys
//   eventDates   - day key -> ISO date (per event)
// Display labels ("Today"/"Tomorrow") are computed from a date, never stored.

import type { YardSaleRecord } from './sheets'

export interface YardSaleColumns {
  address: string
  sellingList: string[]
  cancelled: string
  day: string
}

export interface YardSaleConfig {
  spreadsheetId: string
  spreadsheetUrl: string
  apiKey: string
  boundsUrls: string[]
  columns: YardSaleColumns
  scheduleMap: Record<string, string[]>
  eventDates: Record<string, string>
  timezone: string
  accentColor: string
}

// Everything optional: callers pass whatever they have, whenever they have it.
export interface YardSaleConfigInput {
  spreadsheetId?: string
  spreadsheetUrl?: string
  apiKey?: string
  boundsUrls?: string[] | string
  columns?: {
    address?: string
    sellingList?: string[] | string
    cancelled?: string
    day?: string
  }
  scheduleMap?: Record<string, string[]>
  eventDates?: Record<string, string>
  timezone?: string
  accentColor?: string
}

export function emptyConfig(): YardSaleConfig {
  return {
    spreadsheetId: '',
    spreadsheetUrl: '',
    apiKey: '',
    boundsUrls: [],
    columns: { address: '', sellingList: [], cancelled: '', day: '' },
    scheduleMap: {},
    eventDates: {},
    timezone: '',
    accentColor: '',
  }
}

export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

// Merge input over the current config. undefined leaves the current value;
// an explicit '' clears it. Supports repeated partial calls.
export function mergeConfig(current: YardSaleConfig, input: YardSaleConfigInput): YardSaleConfig {
  return {
    spreadsheetId: input.spreadsheetId ?? current.spreadsheetId,
    spreadsheetUrl: input.spreadsheetUrl ?? current.spreadsheetUrl,
    apiKey: input.apiKey ?? current.apiKey,
    boundsUrls: input.boundsUrls !== undefined ? toStringArray(input.boundsUrls) : current.boundsUrls,
    columns: {
      address: input.columns?.address ?? current.columns.address,
      sellingList:
        input.columns?.sellingList !== undefined
          ? toStringArray(input.columns.sellingList)
          : current.columns.sellingList,
      cancelled: input.columns?.cancelled ?? current.columns.cancelled,
      day: input.columns?.day ?? current.columns.day,
    },
    scheduleMap: input.scheduleMap ?? current.scheduleMap,
    eventDates: input.eventDates ?? current.eventDates,
    timezone: input.timezone ?? current.timezone,
    accentColor: input.accentColor ?? current.accentColor,
  }
}

export function getAddress(record: YardSaleRecord, config: YardSaleConfig): string {
  return record[config.columns.address] ?? ''
}

export function getSellingItems(record: YardSaleRecord, config: YardSaleConfig): string[] {
  const items: string[] = []
  for (const column of config.columns.sellingList) {
    for (const raw of record[column]?.split(',') ?? []) {
      const item = raw.trim()
      if (item) items.push(item)
    }
  }
  return items
}

// Day keys a record participates in, or null when the event has no schedule.
export function getDayKeys(record: YardSaleRecord, config: YardSaleConfig): string[] | null {
  if (!config.columns.day) return null
  return config.scheduleMap[record[config.columns.day] ?? ''] ?? []
}

// Cancelled if the cancel column has any value, or the schedule resolves to no days.
export function isCancelled(record: YardSaleRecord, config: YardSaleConfig): boolean {
  if (config.columns.cancelled && record[config.columns.cancelled]) return true
  const keys = getDayKeys(record, config)
  return keys !== null && keys.length === 0
}

// Visible under the current day toggles. Records with no schedule always show.
// A scheduled record shows if it participates in at least one non-deselected day.
export function isDayVisible(
  record: YardSaleRecord,
  config: YardSaleConfig,
  deselectedDays: string[],
): boolean {
  const keys = getDayKeys(record, config)
  if (keys === null || keys.length === 0) return true
  if (deselectedDays.length === 0) return true
  return keys.some(key => !deselectedDays.includes(key))
}

export function dayLabel(iso: string, timezone: string, now = new Date()): string {
  const tz = timezone || undefined
  const today = now.toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined)
  const diff = Math.round((Date.parse(iso) - Date.parse(today)) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(tz ? { timeZone: tz } : {}),
  })
}

export function getDayLabels(
  record: YardSaleRecord,
  config: YardSaleConfig,
  now = new Date(),
): string[] {
  const keys = getDayKeys(record, config) ?? []
  return keys
    .map(key => config.eventDates[key])
    .filter((iso): iso is string => Boolean(iso))
    .sort()
    .map(iso => dayLabel(iso, config.timezone, now))
}

export function matches(record: YardSaleRecord, query: string, config: YardSaleConfig): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [getAddress(record, config), ...getSellingItems(record, config)]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}
