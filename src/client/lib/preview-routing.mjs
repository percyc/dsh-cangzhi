/** Metadata-first routing for workbench document and evidence previews. */

function token(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function record(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null
}

function hasTableLocation(value) {
  const location = record(value)
  if (location === null) return false
  return Boolean(location.sheet_name)
    || (Array.isArray(location.table_ranges) && location.table_ranges.length > 0)
    || (Array.isArray(location.column_names) && location.column_names.length > 0)
}

/**
 * Server metadata is authoritative. Content sniffing exists only for legacy
 * evidence payloads that predate `evidence_type` / `document_type`.
 */
export function classifyEvidencePreview(context, rows) {
  const payload = record(context) ?? {}
  const evidenceType = token(payload.evidence_type)
  const documentType = token(payload.document_type)
  const rowPayload = record(rows)
  const hasRows = rowPayload !== null && Array.isArray(rowPayload.rows)

  if (
    evidenceType === 'dataset'
    || hasRows
    || record(payload.dataset) !== null
    || hasTableLocation(payload.table_location)
    || ['xlsx', 'xls', 'csv', 'spreadsheet', 'database_table'].includes(documentType)
  ) return 'dataset'

  if (
    evidenceType === 'markdown'
    || documentType === 'markdown'
    || documentType === 'note'
  ) return 'markdown'

  if (
    evidenceType === 'pdf_word'
    || evidenceType === 'document'
    || ['pdf', 'doc', 'docx'].includes(documentType)
  ) return 'document'

  const markdown = typeof payload.context_markdown === 'string' ? payload.context_markdown : ''
  if (evidenceType === '' && documentType === '' && looksLikeMarkdown(markdown)) return 'markdown'
  if (markdown.trim() || (typeof payload.snippet === 'string' && payload.snippet.trim())) return 'document'
  return 'empty'
}

export function classifyDocumentPreview({ contentKind, sourceType, documentType, title } = {}) {
  const kind = token(contentKind)
  const source = token(sourceType)
  const type = token(documentType)
  const name = token(title)
  if (kind === 'dataset' || ['xlsx', 'xls', 'csv', 'spreadsheet'].includes(type)) return 'dataset'
  if (source === 'note' || ['markdown', 'md', 'note'].includes(type) || /\.md$/u.test(name)) return 'markdown'
  if (['pdf', 'doc', 'docx'].includes(type) || /\.(pdf|docx?)$/u.test(name)) return 'binary-document'
  return 'text'
}

/**
 * Resolve the immutable dataset identity after the evidence context has been
 * version-checked by the server. A disagreement is rejected rather than
 * silently opening a different table.
 */
export function resolveEvidenceDatasetId(context, linkedDatasetId) {
  const payload = record(context) ?? {}
  const dataset = record(payload.dataset)
  const contextId = positiveId(dataset?.dataset_id)
  const linkedId = positiveId(linkedDatasetId)
  if (contextId !== null && linkedId !== null && contextId !== linkedId) return null
  return contextId ?? linkedId
}

function positiveId(value) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/u.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export function looksLikeMarkdown(value) {
  if (typeof value !== 'string' || value.trim() === '') return false
  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/u.test(value)
    || /(^|\n)\s*\|.*\|\s*\n\s*\|?\s*:?-{3,}/u.test(value)
}
