import { describe, expect, it } from 'vitest'
import { escapeHtml, renderTemplate } from '../src/utils/template'
import { DEFAULT_POPUP_TEMPLATE, emptyConfig, popupVars } from '../src/utils/config'

describe('renderTemplate', () => {
  it('substitutes and escapes values', () => {
    expect(renderTemplate('<p>{{name}}</p>', { name: 'Tom & <b>Jo</b>' })).toBe(
      '<p>Tom &amp; &lt;b&gt;Jo&lt;/b&gt;</p>',
    )
  })

  it('leaves triple-brace values as markup', () => {
    expect(renderTemplate('<ul>{{{items}}}</ul>', { items: '<li>Books</li>' })).toBe(
      '<ul><li>Books</li></ul>',
    )
  })

  it('resolves unknown names to nothing', () => {
    expect(renderTemplate('[{{missing}}]', {})).toBe('[]')
  })

  it('keeps a section when the value is non-empty', () => {
    expect(renderTemplate('{{#days}}<b>{{days}}</b>{{/days}}', { days: 'Saturday' })).toBe(
      '<b>Saturday</b>',
    )
  })

  it('drops a section when the value is empty or whitespace', () => {
    expect(renderTemplate('{{#days}}<b>{{days}}</b>{{/days}}', { days: '  ' })).toBe('')
    expect(renderTemplate('{{#days}}<b>x</b>{{/days}}', {})).toBe('')
  })

  it('handles column names containing spaces and punctuation', () => {
    const template = '{{#What day(s)?}}{{What day(s)?}}{{/What day(s)?}}'
    expect(renderTemplate(template, { 'What day(s)?': 'Sat & Sun' })).toBe('Sat &amp; Sun')
  })
})

describe('escapeHtml', () => {
  it('escapes the five markup characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
  })
})

describe('popupVars', () => {
  const config = {
    ...emptyConfig(),
    columns: { address: 'Address', sellingList: ['Selling'], cancelled: '', day: 'Day' },
    scheduleMap: { Saturday: ['sat'] },
    eventDates: { sat: '2026-09-19' },
    timezone: 'America/Los_Angeles',
  }
  const record = {
    Address: '2350 SE 57th Ave',
    Selling: 'Books, Tools',
    Day: 'Saturday',
  }

  it('exposes derived values and raw sheet columns', () => {
    const vars = popupVars(record, config, new Date('2026-09-19T12:00:00Z'))
    expect(vars.address).toBe('2350 SE 57th Ave')
    expect(vars.selling).toBe('Books, Tools')
    expect(vars.sellingList).toBe('<li>Books</li><li>Tools</li>')
    expect(vars.days).toBe('Today')
    expect(vars.Address).toBe('2350 SE 57th Ave')
  })

  it('renders address, days and items in the default template', () => {
    const vars = popupVars(record, config, new Date('2026-09-19T12:00:00Z'))
    const html = renderTemplate(DEFAULT_POPUP_TEMPLATE, vars)
    expect(html).toContain('<h2>2350 SE 57th Ave</h2>')
    expect(html).toContain('Today')
    expect(html).toContain('<li>Books</li>')
  })

  it('drops the selling block when nothing is listed', () => {
    const html = renderTemplate(
      DEFAULT_POPUP_TEMPLATE,
      popupVars({ Address: '1 Main St', Day: 'Saturday' }, config),
    )
    expect(html).not.toContain('Selling')
    expect(html).toContain('1 Main St')
  })
})
