import { For, Show, createMemo } from 'solid-js'
import { noShadowDOM } from 'solid-element'
import { config, records } from './store'
import { getAddress, getSellingItems, getDayLabels } from './utils/config'

export default function YardSaleTable() {
  noShadowDOM()

  const rows = createMemo(() =>
    records().map(record => ({
      address: getAddress(record, config),
      selling: getSellingItems(record, config).join(', '),
      days: getDayLabels(record, config).join(' & '),
    })),
  )

  // Show the day column whenever the event has dates (any visible row has one).
  const showDayColumn = () => rows().some(row => row.days.length > 0)

  return (
    <div class="ys-table">
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Selling</th>
            <Show when={showDayColumn()}>
              <th>Day(s)</th>
            </Show>
          </tr>
        </thead>
        <tbody>
          <For each={rows()}>
            {row => (
              <tr>
                <td>{row.address}</td>
                <td>{row.selling}</td>
                <Show when={showDayColumn()}>
                  <td>{row.days}</td>
                </Show>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
