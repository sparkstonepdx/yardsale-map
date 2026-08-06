import { noShadowDOM } from 'solid-element'
import { YardSaleConfigInput } from './utils/config'
import { For, onMount } from 'solid-js'
import { configureYardSale } from './store'
import YardSaleMap from './YardSaleMap'
import YardSaleTable from './YardSaleTable'
import YardSaleSearch from './YardSaleSearch'
import YardSaleDayFilter from './YardSaleDayFilter'
import { Dynamic } from 'solid-js/web'
import { Json, fromJson } from './utils/json'

const elements = {
  map: YardSaleMap,
  table: YardSaleTable,
  search: YardSaleSearch,
  filter: YardSaleDayFilter,
} as const

export type YardSaleElementName = keyof typeof elements

export interface YardSaleFullProps {
  config: Json<YardSaleConfigInput> | YardSaleConfigInput
  elements: YardSaleElementName[]
  style?: string;
  'data-style'?: string;
}

export default function YardSaleFull(props: YardSaleFullProps) {
  noShadowDOM()

  onMount(() => {
    configureYardSale(fromJson(props.config))
  })

  return (
    <div style={props.style || props['data-style']}>
      <For each={fromJson(props.elements)}>
        {element => <Dynamic component={elements[element]} />}
      </For>
    </div>
  )
}
