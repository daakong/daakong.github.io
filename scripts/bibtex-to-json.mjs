import fs from 'node:fs/promises'

const sourcePath = new URL('../data/raw/publications.bib', import.meta.url)
const targetPath = new URL('../src/data/publications.json', import.meta.url)

function parseBibFieldValue(raw) {
  if (!raw) return ''
  let value = raw.trim()
  if (value.startsWith('{') && value.endsWith('}')) {
    value = value.slice(1, -1)
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  return value
}

function normalizeCategory(type) {
  const lower = type.toLowerCase()
  if (lower.includes('inproceedings') || lower.includes('conference')) return 'conference'
  if (lower.includes('article')) return 'journal'
  return 'other'
}

function parseEntries(raw) {
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,]+),([\s\S]*?)\n\}/g
  const entries = []
  let match

  while ((match = entryRegex.exec(raw)) !== null) {
    const [, rawType, key, body] = match
    const fields = {}
    const fieldRegex = /([a-zA-Z_]+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|\"[^\"]*\"|[^,\n]+)\s*(?:,|$)/g
    let fieldMatch

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase()
      fields[fieldName] = parseBibFieldValue(fieldMatch[2])
    }

    const title = fields.title || ''
    const authors = fields.author
      ? fields.author
          .split(/\s+and\s+/i)
          .map((author) => author.trim())
          .filter(Boolean)
      : []
    const venue = fields.journal || fields.booktitle || fields.conference || ''
    const year = Number(fields.year) || null
    const arxivId = fields.eprint || ''
    const links = []

    if (fields.url) links.push({ label: 'Page', href: fields.url })
    if (arxivId) links.push({ label: 'arXiv', href: `https://arxiv.org/abs/${arxivId}` })
    if (fields.doi) {
      const cleaned = fields.doi.replace(/^https?:\/\/doi.org\//, '')
      links.push({ label: 'DOI', href: `https://doi.org/${cleaned}` })
    }

    entries.push({
      id: key.trim(),
      title,
      authors,
      venue,
      year,
      type: normalizeCategory(rawType),
      month: fields.month || '',
      note: fields.note || '',
      arxiv: arxivId,
      links,
    })
  }

  return entries
}

const raw = await fs.readFile(new URL(sourcePath), 'utf8')
const items = parseEntries(raw).sort((a, b) => (b.year || 0) - (a.year || 0))

await fs.writeFile(
  new URL(targetPath),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    items,
  }, null, 2)}\n`
)

console.log(`Generated ${items.length} publication records to src/data/publications.json`)
