// Minimal mustache-shaped renderer for popup templates.
//
// Supported syntax:
//   {{name}}              value, HTML-escaped
//   {{{name}}}            value, inserted as-is (only for values we build)
//   {{#name}}...{{/name}} the block, only when the value is non-empty
//
// Unknown names resolve to an empty string. Sections are not nested.

const SECTION = /\{\{#\s*([^}]+?)\s*\}\}([\s\S]*?)\{\{\/\s*\1\s*\}\}/g
const RAW = /\{\{\{\s*([^}]+?)\s*\}\}\}/g
const ESCAPED = /\{\{\s*([^#/{][^}]*?)\s*\}\}/g

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  const get = (name: string) => vars[name] ?? ''

  return template
    .replace(SECTION, (_match, name: string, body: string) => (get(name).trim() ? body : ''))
    .replace(RAW, (_match, name: string) => get(name))
    .replace(ESCAPED, (_match, name: string) => escapeHtml(get(name)))
}
