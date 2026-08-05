import { customElement } from 'solid-element'
import YardSaleMap from './YardSaleMap'
import YardSaleTable from './YardSaleTable'
import YardSaleSearch from './YardSaleSearch'
import YardSaleDayFilter from './YardSaleDayFilter'
import { configureYardSale } from './store'
import './yard-sale.css'
import YardSaleFull, { YardSaleElementName } from './YardSaleFull'
import { YardSaleColumns, YardSaleConfigInput } from './utils/config'

// Elements take no config attributes: everything comes from configureYardSale().
customElement('yard-sale-map', {}, YardSaleMap)
customElement('yard-sale-table', {}, YardSaleTable)
customElement('yard-sale-search', { placeholder: 'Search sales' }, YardSaleSearch)
customElement('yard-sale-day-filter', {}, YardSaleDayFilter)
customElement(
  'yard-sale-full',
  {
    config: {} as YardSaleConfigInput,
    elements: [] as YardSaleElementName[],
  },
  YardSaleFull,
)

// Expose the config entry point for a plain <script> on the page.
export { configureYardSale }
export type { YardSaleConfigInput } from './utils/config'

declare global {
  interface Window {
    configureYardSale: typeof configureYardSale
  }
}
if (typeof window !== 'undefined') window.configureYardSale = configureYardSale
