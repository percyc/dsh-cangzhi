/** Pure extraction helpers for replay-stable, version-bound Cangzhi evidence. */

export function idNumber(value) {
  const id = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function optionalString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function positiveRows(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(idNumber).filter(item => item !== null))]
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.length > 0)
    : []
}

function evidenceLinkFromObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const documentId = idNumber(value.document_id ?? value.documentId)
  if (documentId === null) return null
  const documentVersionId = idNumber(value.document_version_id ?? value.documentVersionId)
  const nestedChunk = typeof value.chunk === 'object' && value.chunk !== null && !Array.isArray(value.chunk)
    ? value.chunk
    : undefined
  const explicitChunkId = value.chunk_id ?? value.chunkId
  const chunkId = idNumber(explicitChunkId ?? nestedChunk?.id)
  const explicitChunkType = value.chunk_type ?? value.chunkType
  const chunkType = optionalString(explicitChunkType)
    ?? optionalString(nestedChunk?.type)
    ?? optionalString(nestedChunk?.chunk_type)
  const datasetId = idNumber(value.dataset_id ?? value.datasetId)
  // A bare document identity is useful for browsing, but is not evidence: it
  // cannot prove which version/fragment supported the answer.
  if (chunkId === null && datasetId === null) return null
  const title = optionalString(value.title)
    ?? optionalString(value.document_title)
    ?? `资料 #${String(documentId)}`
  const snippet = optionalString(value.snippet)
    ?? optionalString(value.context_markdown)
    ?? optionalString(value.summary)
  const queryPlan = typeof value.query_plan === 'object' && value.query_plan !== null
    ? value.query_plan
    : undefined
  return {
    documentId,
    documentVersionId,
    chunkId,
    chunkType: chunkType ?? null,
    datasetId,
    artifactVersion: idNumber(value.artifact_version ?? value.artifactVersion),
    evidenceType: optionalString(value.evidence_type ?? value.evidenceType)
      ?? (datasetId === null ? 'document' : 'dataset'),
    title,
    snippet,
    page: idNumber(value.page ?? nestedChunk?.page),
    headingPath: stringArray(value.heading_path ?? value.headingPath ?? nestedChunk?.heading_path),
    sourceRows: positiveRows(value.source_rows ?? value.sourceRows),
    columns: stringArray(value.columns ?? queryPlan?.columns),
    queryPlan,
  }
}

function collectEvidenceLinks(value, accumulator, seen) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  if (Array.isArray(value)) {
    for (const item of value) collectEvidenceLinks(item, accumulator, seen)
    return
  }
  const direct = evidenceLinkFromObject(value)
  if (direct !== null) accumulator.push(direct)
  for (const nested of Object.values(value)) collectEvidenceLinks(nested, accumulator, seen)
}

export function collectStructuredEvidence(value) {
  if (value === null || typeof value !== 'object') return []
  const links = []
  collectEvidenceLinks(value, links, new Set())
  return links
}

function evidenceKey(link) {
  if (link.chunkId !== null && link.chunkId !== undefined) {
    return `chunk:${link.chunkId}:v${link.documentVersionId ?? ''}`
  }
  return `dataset:${link.datasetId ?? ''}:v${link.documentVersionId ?? ''}:a${link.artifactVersion ?? ''}:r${(link.sourceRows ?? []).join(',')}`
}

export function dedupeEvidenceLinks(links, limit) {
  const out = []
  const seen = new Set()
  for (const link of links) {
    const key = evidenceKey(link)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(link)
    if (typeof limit === 'number' && out.length >= limit) break
  }
  return out
}

/**
 * Decide whether a single link looks like a `dataset_catalog` discovery
 * hint surfaced by `knowledge_search`: it identifies a document version
 * and sometimes a dataset, but does not contribute concrete rows.
 *
 * A link is a catalog hint when any of the following hold:
 * - `chunkType === 'dataset_catalog'` (the durable contract from the
 *   search payload, which may carry an explicit `chunk_id` for the
 *   catalog row entry).
 * - Legacy structural fallback: `chunkId` and `chunkType` are both
 *   missing AND `sourceRows` is empty. Document chunks (no `datasetId`)
 *   and version-less triples never match.
 */
export function isCatalogHint(link) {
  if (link === null || typeof link !== 'object') return false
  if (link.documentVersionId === null || link.documentVersionId === undefined) return false
  if (!Array.isArray(link.sourceRows) || link.sourceRows.length !== 0) return false
  if (link.chunkType === 'dataset_catalog') return true
  if (link.datasetId === null || link.datasetId === undefined) return false
  if ((link.chunkId === null || link.chunkId === undefined)
    && (link.chunkType === null || link.chunkType === undefined)) return true
  return false
}

/**
 * Collapse the final answer evidence list so that version-bound dataset
 * evidence with concrete `source_rows` shadows bare catalog discovery
 * hints. New payloads match the (document, version, dataset) triple; search
 * payloads that omit datasetId fall back to the document-version identity.
 *
 * - Regular document chunks (no `datasetId`) are never touched.
 * - Catalog hints without a `documentVersionId` are never touched.
 * - Different documents, different versions or different datasets are
 *   never collapsed — identity is structural, not title-based.
 * - "Exact" evidence is the same triple with non-empty `sourceRows`
 *   AND no `dataset_catalog` chunkType; this means a lone catalog hint
 *   with empty `sourceRows` never suppresses itself, and a regular
 *   dataset chunk without rows is left alone.
 * - When no exact dataset evidence exists, catalog hints survive.
 * - Order is preserved relative to the first non-suppressed entry.
 */
export function suppressCatalogHints(links) {
  if (!Array.isArray(links)) return []
  const exactKeys = new Set()
  const exactDocumentVersions = new Set()
  for (const link of links) {
    if (link === null || typeof link !== 'object') continue
    if (link.datasetId === null || link.datasetId === undefined) continue
    if (link.documentVersionId === null || link.documentVersionId === undefined) continue
    if (!Array.isArray(link.sourceRows) || link.sourceRows.length === 0) continue
    if (link.chunkType === 'dataset_catalog') continue
    exactKeys.add(`${link.documentId}:${link.documentVersionId}:${link.datasetId}`)
    exactDocumentVersions.add(`${link.documentId}:${link.documentVersionId}`)
  }
  if (exactKeys.size === 0) return links.slice()
  const out = []
  for (const link of links) {
    if (isCatalogHint(link)) {
      const exactMatch = link.datasetId === null || link.datasetId === undefined
        ? exactDocumentVersions.has(`${link.documentId}:${link.documentVersionId}`)
        : exactKeys.has(`${link.documentId}:${link.documentVersionId}:${link.datasetId}`)
      if (exactMatch) continue
    }
    out.push(link)
  }
  return out
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

/** Extract evidence from the persisted model-facing content of one tool result. */
export function evidenceFromToolResult(toolName, content) {
  if (typeof toolName !== 'string' || !toolName.startsWith('mcp__cangzhi__')) return []
  const values = []
  const visit = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }
    if (typeof value !== 'object' || value === null) return
    if (value.type === 'text' && typeof value.text === 'string') {
      const parsed = safeParseObject(value.text)
      if (parsed !== null) values.push(parsed)
    }
    for (const nested of Object.values(value)) visit(nested)
  }
  visit(content)
  return dedupeEvidenceLinks(values.flatMap(collectStructuredEvidence))
}

// Legacy prose parsing remains for old tool-card history only. The durable
// answer evidence node never uses it.
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
  return {
    documentId,
    documentVersionId: null,
    chunkId: null,
    datasetId,
    artifactVersion: null,
    evidenceType: 'dataset',
    title: titleMatch?.[1]?.trim() || '数据表证据',
    snippet: undefined,
    page: null,
    headingPath: [],
    sourceRows: [],
    columns: [],
    queryPlan: undefined,
  }
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

export function formatEvidenceLink(link) {
  if (link === null || typeof link !== 'object') return ''
  const parts = [`document_id ${link.documentId}`]
  if (link.documentVersionId) parts.push(`version ${link.documentVersionId}`)
  if (link.chunkId) parts.push(`chunk ${link.chunkId}`)
  if (link.datasetId) parts.push(`dataset ${link.datasetId}`)
  if (link.sourceRows?.length) parts.push(`rows ${link.sourceRows.join(', ')}`)
  return parts.join(' · ')
}
