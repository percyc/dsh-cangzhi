/**
 * Single source of truth for the Cangzhi MCP tool public names. Shared by the
 * Host policy restriction, the per-session scoped overrides and the regression
 * tests so the set can never drift between the deny mask and the override set.
 */

/** MCP server namespace registered for cangzhi in the DSH MCP bridge. */
export const CANGZHI_SERVER_NAME = 'cangzhi'

/** All model-facing `mcp__cangzhi__*` tool names. */
export const CANGZHI_TOOLS = Object.freeze([
  'mcp__cangzhi__knowledge_list_scopes',
  'mcp__cangzhi__knowledge_list_facets',
  'mcp__cangzhi__knowledge_list_documents',
  'mcp__cangzhi__knowledge_search',
  'mcp__cangzhi__knowledge_ask',
  'mcp__cangzhi__knowledge_get_document',
  'mcp__cangzhi__knowledge_get_chunk',
  'mcp__cangzhi__knowledge_list_datasets',
  'mcp__cangzhi__knowledge_get_dataset_schema',
  'mcp__cangzhi__knowledge_preview_dataset_rows',
  'mcp__cangzhi__knowledge_query_dataset',
  'mcp__cangzhi__knowledge_get_evidence_by_chunk',
  'mcp__cangzhi__knowledge_get_evidence_by_dataset',
  'mcp__cangzhi__knowledge_preview_evidence_rows'
])