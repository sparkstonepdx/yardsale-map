import { For, Show } from 'solid-js'
import { noShadowDOM } from 'solid-element'
import { availableDays, deselectedDays, toggleDay } from './store'

export default function YardSaleDayFilter() {
  noShadowDOM()

  return (
    <Show when={availableDays().length > 0}>
      <fieldset class="ys-day-filter" style="margin-top: 20px">
        <legend>Show sales for:</legend>
        <For each={availableDays()}>
          {day => (
            <label>
              <input
                type="checkbox"
                checked={!deselectedDays().includes(day.key)}
                onChange={() => toggleDay(day.key)}
              />{' '}
              <span>{day.label}</span>
            </label>
          )}
        </For>
      </fieldset>
    </Show>
  )
}
