import { noShadowDOM } from 'solid-element'
import { query, setQuery } from './store'

export interface YardSaleSearchProps {
  placeholder: string
}

export default function YardSaleSearch(props: YardSaleSearchProps) {
  noShadowDOM()

  return (
    <div class="ys-search">
      <input
        type="search"
        placeholder={props.placeholder}
        value={query()}
        onInput={e => setQuery(e.currentTarget.value)}
      />
    </div>
  )
}
