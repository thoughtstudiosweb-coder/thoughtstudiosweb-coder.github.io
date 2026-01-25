import { marked } from 'marked'

// Keep markdown rendering consistent across server + client.
// `breaks: true` makes single newlines render as <br>, which is usually what
// you want for short-form "notes" style writing.
marked.setOptions({
  gfm: true,
  breaks: true,
})

export function renderMarkdownToHtml(markdown: string): string {
  // `marked.parse()` can be async if configured; we force sync behavior here.
  const html = marked.parse(markdown || '', { async: false }) as string
  return typeof html === 'string' ? html : ''
}

// Useful for previews/excerpts where block wrappers like <p> break line-clamp/layout.
export function renderMarkdownInlineToHtml(markdown: string): string {
  const html = marked.parseInline(markdown || '', { async: false }) as string
  return typeof html === 'string' ? html : ''
}

