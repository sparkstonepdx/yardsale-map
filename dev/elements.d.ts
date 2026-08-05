import 'solid-js'
import { YardSaleFullProps } from 'src/YardSaleFull'

// Elements take no config attributes now; config comes from configureYardSale().
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'yard-sale-map': JSX.HTMLAttributes<HTMLElement>
      'yard-sale-table': JSX.HTMLAttributes<HTMLElement>
      'yard-sale-search': JSX.HTMLAttributes<HTMLElement> & { placeholder?: string }
      'yard-sale-day-filter': JSX.HTMLAttributes<HTMLElement>
      'yard-sale-full': JSX.HTMLAttributes<HTMLElement> & YardSaleFullProps
    }
  }
}
