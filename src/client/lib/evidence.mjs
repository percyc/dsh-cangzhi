/**
 * Pure helpers that extract `document_id` / `dataset_id` references from
 * the structured result of any `mcp__cangzhi__*` tool. We avoid fragile
 * regex on the answer text where possible: the MCP wrapper always surfaces
 * a JSON object whose nested fields can carry the references, and the
 * `cangzhi-open-document` event already routes them to the workbench.
 *
 * The text fallback only runs when the JSON path finds nothing, so the
 * legacy "open the data table evidence in the right pane" behaviour is
 * preserved without depending on brittle sentence parsing.
 */

export function idNumber(value) {
  const id = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function evidenceLinkFromObject(value) {
  if (typeof value !== 'object' || value === null) return null
  const object = value
  const documentId = idNumber(object.document_id ?? object.documentId)
  if (documentId === null) return null
  const datasetId = idNumber(object.dataset_id ?? object.datasetId)
  const title = typeof object.title === 'string' && object.title.trim().length > 0
    ? object.title.trim()
    : typeof object.document_title === 'string' && object.document_title.trim().length > 0
      ? object.document_title.trim()
      : `资料 #${String(documentId)}`
  const snippet = typeof object.snippet === 'string'
    ? object.snippet
    : typeof object.summary === 'string'
      ? object.summary
      : undefined
  return { documentId, datasetId, title, snippet }
}

function collectEvidenceLinks(value, accumulator) {
  if (Array.isArray(value)) {
    for (const item of value) collectEvidenceLinks(item, accumulator)
    return
  }
  if (typeof value !== 'object' || value === null) return
  const direct = evidenceLinkFromObject(value)
  if (direct !== null) {
    accumulator.push(direct)
    return
  }
  for (const nested of Object.values(value)) collectEvidenceLinks(nested, accumulator)
}

export function collectStructuredEvidence(value) {
  if (value === null || typeof value !== 'object') return []
  const links = []
  collectEvidenceLinks(value, links)
  return links
}

export function dedupeEvidenceLinks(links, limit) {
  const out = []
  const seen = new Set()
  for (const link of links) {
    const key = `${link.documentId}:${link.datasetId ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(link)
    if (typeof limit === 'number' && out.length >= limit) break
  }
  return out
}

const DOCUMENT_ID_PATTERN = /(?:document[_\s-]*id|文档(?:\s*[Ii][Dd])?)\s*(?:[=:：]|是|为)?\s*\*{0,2}(\d+)\*{0,2}/iu
const DATASET_ID_PATTERN = /(?:dataset[_\s-]*id|数据集(?:\s*[Ii][Dd])?)\s*(?:[=:：]|是|为)?\s*\*{0,2}(\d+)\*{0,2}/iu
const ANSWER_TITLE_PATTERN = /《([^》]+)》/u

export function fallbackAnswerEvidence(answer) {
  if (typeof answer !== 'string' || answer.length === 0) return null
  const documentMatch = DOCUMENT_ID_PATTERN.exec(answer)
  const datasetMatch = DATASET_ID_PATTERN.exec(answer)
  if (documentMatch === null || datasetMatch === null) return null
  const documentId = Number(documentMatch[1])
  const datasetId = Number(datasetMatch[1])
  if (!Number.isSafeInteger(documentId) || documentId <= 0) return null
  if (!Number.isSafeInteger(datasetId) || datasetId <= 0) return null
  const titleMatch = ANSWER_TITLE_PATTERN.exec(answer)
  const title = titleMatch?.[1]?.trim() || '数据表证据'
  return { documentId, datasetId, title, snippet: undefined }
}

export function answerEvidence(answer) {
  if (typeof answer !== 'string' || answer.length === 0) return null
  const parsed = safeParseObject(answer)
  if (parsed !== null) {
    const structured = collectStructuredEvidence(parsed)
    const withDataset = structured.find(link => link.datasetId !== null)
    if (withDataset !== undefined) return withDataset
  }
  return fallbackAnswerEvidence(answer)
}

function safeParseObject(text) {
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  if (trimmed.length === 0 || trimmed[0] !== '{' && trimmed[0] !== '[') return null
  try {
    const value = JSON.parse(trimmed)
    return typeof value === 'object' && value !== null ? value : null
  } catch {
    return null
  }
}

export function formatEvidenceLink(link) {
  if (link === null || typeof link !== 'object') return ''
  const parts = [`document_id ${link.documentId}`]
  if (link.datasetId !== null && link.datasetId !== undefined) parts.push(`dataset_id ${link.datasetId}`)
  return parts.join(' · ')
}
