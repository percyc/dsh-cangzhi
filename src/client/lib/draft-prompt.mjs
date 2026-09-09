/** Prepare a plain-text append without rewriting structured editor content. */
export function prepareKnowledgeDraft(input, prompt) {
  if (!input || input.phase !== 'plain' || input.occurrences?.length > 0) {
    return { error: '草稿包含引用卡片或正在提交，已保留原内容。请先完成编辑，再准备资料提问。' }
  }
  const draft = typeof input.draft === 'string' ? input.draft : ''
  const addition = typeof prompt === 'string' ? prompt.trim() : ''
  if (!addition || draft.includes(addition)) return { draft }
  return { draft: draft ? `${draft}\n\n${addition}\n\n` : `${addition}\n\n` }
}
