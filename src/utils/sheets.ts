// Data loading for the yard-sale map.
// Fetches Form Responses directly from the Google Sheets REST API.
// Records are keyed by their raw sheet-header text; column meaning is resolved
// from config, not here.

export type YardSaleRecord = {
  Latitude?: string
  Longitude?: string
  [column: string]: string | undefined
}

export function extractSpreadsheetId(url: string): string {
  if (!url) return ''
  return url.match(/\/d\/([0-9a-zA-Z_-]+)/)?.[1] ?? ''
}

function getRecordFromRow(row: string[], headers: string[]): YardSaleRecord {
  return Object.fromEntries(row.map((cell, i) => [headers[i] ?? '', cell]))
}

export async function loadYardSales(
  spreadsheetId: string,
  apiKey: string,
): Promise<YardSaleRecord[]> {
  const range = "'Form Responses 1'!A1:Z"
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
    `/values/${encodeURIComponent(range)}?key=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`)

  const data: { values?: string[][] } = await res.json()
  const values = data.values ?? []
  if (values.length <= 1) return []

  const headers = values[0] ?? []
  return values
    .filter((row, i) => i > 0 && row[0]?.length)
    .map(row => getRecordFromRow(row, headers))
}
