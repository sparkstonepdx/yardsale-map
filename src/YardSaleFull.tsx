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

interface Props {
  config: Json<YardSaleConfigInput> | YardSaleConfigInput
  elements: (keyof typeof elements)[]
}

export default function YardSaleFull(props: Props) {
  noShadowDOM()

  onMount(() => {
    configureYardSale(fromJson(props.config))
  })

  return (
    <>
      <For each={props.elements}>{element => <Dynamic component={elements[element]} />}</For>
    </>
  )
}
