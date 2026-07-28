import { createSignal, createEffect, type Component } from 'solid-js'
import { configureYardSale } from 'src' // also registers the custom elements

const BOUNDS_URLS = ['/geojson/mt_tabor.geojson', '/geojson/north_tabor.geojson']

// North Tabor: single-day event, no day column. Cancellation via the flag.
const ADDRESS_COLUMN = 'Full address of yard sale location (e.g. 2350 SE 57th Portland, OR 97215)'
const SELLING_COLUMNS = [
  `In order to help visitors plan their route, please pick a max of 3 of the MAIN ITEMS you will be selling. This will help buyers to plan their route.

Note: You are welcome to sell anything you like`,
  `We'd love to have yard sale hosts provide food, drinks or relevant services. Please add a comment here with more information if this applies to you. Include the type of product you plan to sell so we can help advertise.`,
]
const CANCELLED_COLUMN =
  'If in the future you are no longer able to host your sale do to unforeseen circumstances, you can come back and check the box below'

// For a Sat/Sun/Both/Neither neighborhood, add to the configureYardSale call:
//   columns: { day: 'What day(s) do you plan to participate in the yard sale?' },
//   scheduleMap: {
//     'Both days, Sept 19 and Sept 20 (9:00 a.m. to 3:00 p.m.)': ['sat', 'sun'],
//     'Neither (if you need to cancel)': [],
//   },
//   eventDates: { sat: '2026-09-19', sun: '2026-09-20' },
//   timezone: 'America/Los_Angeles',

const load = (key: string, fallback: string) => localStorage.getItem(key) ?? fallback

const App: Component = () => {
  const [sheetId, setSheetId] = createSignal(load('ys.sheetId', ''))
  const [sheetURL, setSheetURL] = createSignal(load('ys.sheetURL', ''))
  const [apiKey, setApiKey] = createSignal(load('ys.apiKey', import.meta.env.VITE_SHEETS_API_KEY))

  createEffect(() => localStorage.setItem('ys.sheetId', sheetId()))
  createEffect(() => localStorage.setItem('ys.apiKey', apiKey()))
  createEffect(() => localStorage.setItem('ys.sheetURL', sheetURL()))

  // Push config into the store whenever the inputs change.
  createEffect(() => {
    configureYardSale({
      spreadsheetId: sheetId(),
      spreadsheetUrl: sheetURL(),
      apiKey: apiKey(),
      accentColor: 'rebeccapurple',
      boundsUrls: BOUNDS_URLS,
      scheduleMap: {
        'Both days, Sept 19 and Sept 20 (9:00 a.m. to 3:00 p.m.)': ['sat', 'sun'],
        'Neither (if you need to cancel)': [],
      },
      eventDates: { sat: '2026-09-19', sun: '2026-09-20' },
      timezone: 'America/Los_Angeles',
      columns: {
        day: 'What day(s) do you plan to participate in the yard sale?',
        address: ADDRESS_COLUMN,
        sellingList: SELLING_COLUMNS,
        cancelled: CANCELLED_COLUMN,
      },
    })
  })

  return (
    <main style={{ 'max-width': '960px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>North Tabor Yard Sale</h1>

      <div class="config">
        <label>
          <span>Spreadsheet ID</span>
          <input value={sheetId()} onInput={e => setSheetId(e.currentTarget.value)} />
        </label>
        <label>
          <span>Spreadsheet URL</span>
          <input value={sheetURL()} onInput={e => setSheetURL(e.currentTarget.value)} />
        </label>
        <label>
          <span>Sheets API key</span>
          <input
            value={apiKey()}
            placeholder="AIza... (needs the Google Sheets API enabled)"
            onInput={e => setApiKey(e.currentTarget.value)}
          />
        </label>
      </div>

      <yard-sale-search></yard-sale-search>
      <yard-sale-day-filter></yard-sale-day-filter>
      <yard-sale-map></yard-sale-map>
      <yard-sale-table></yard-sale-table>
    </main>
  )
}

export default App
