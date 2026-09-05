# ADR-005：在工作台中安全渲染证据 Markdown

日期：2026-09-01  
状态：已采纳（2026-09-01 修订：byte 计数、超长内容先截断后格式化、统一预览入口）

## 背景

`EvidenceWorkbenchPreview` 拿到版本绑定证据后，`context.context_markdown` 一律
以 `<pre className={css.markdownPreview}>` 原样输出。证据正文是来自藏知服务
的版本绑定 Markdown（标题、列表、表格、代码块、粗斜体、链接），用户看到的是
等宽字体的纯文本，标题不突出、列表不缩进、GFM 表格变成一行一行的管道字符，
长表在窄工作台里会硬换行而无法横向滚动。

藏知工作台原本就有“精确上下文 + 数据表 rows”的双视图：精确上下文是
Markdown，数据表是已经成型的 `<table>`。两条路径是独立的、互不覆盖，
数据表部分按 `previewTable` 渲染，精确上下文部分仅用 `<pre>` 兜底。

## 决策

1. **复用 DSH `MarkdownText`**，不引入新的 Markdown 库。
   - `MarkdownText` 在 `@deepseek-ai/dsh-client-ui-primitives` 内，是 DSH 自身
     的统一 Markdown 渲染器，已在 Web Profile 的模块表中被预播种（见
     `packages/client/web/src/seed.ts`），运行时可直接通过
     `require('@deepseek-ai/dsh-client-ui-primitives')` 取到同一个 React 组件
     实例，bundle 也不会把 shiki / katex / micromark 全部内联进来。
   - 该组件的 untrusted-output 策略：链接走 `http(s) / mailto` allowlist，
     图片强制 `http(s)`，原始 HTML 永远作为字面量文本输出；这正是我们想给
     不可信证据字符串的安全模型。
   - 它支持 CommonMark + GFM（表格、任务列表、删除线）+ TeX，正好覆盖证据
     字段实际产出的语法。

2. **保留“原文 / 格式化”切换**。默认进入格式化视图（命中 `shouldRenderFormattedMarkdown`
   时），但工作台永远提供“原文”入口以满足排错、贴回原值、人工核对等需要；
   大于 64 KiB 的 Markdown 必须先由 `truncateEvidenceMarkdown` 安全截断，再判断
   是否可格式化，不能直接退到 `<pre>`。否则大型 GFM 表格会重新暴露 `| --- |`
   等 Markdown 符号。纯空白内容仍不进入渲染管线。
   - 切换按钮只在 `canFormat === true` 时显示，避免在不可格式化证据上误
     导用户。
   - 用户在多个证据间切换时，**最后一次显式选择**会被记住（`preferredView`）
     ，但当某条新证据 `canFormat === false` 时渲染层会强制回落 `raw`，
     而不是停留在“已选中格式化”但实际不可用的状态——确保任意证据都不会
     让用户看到空白面板。
   - 64 KiB / UTF-8 边界由 `byteLengthUtf8` 保证，详见决策 4；截断边界使用二分
     查找，避免大型表格在主线程执行逐字符重复编码。
   - 普通资料正文与版本绑定证据复用 `WorkbenchMarkdownPreview`，避免从不同入口
     打开同一份 Markdown 时分别显示格式化表格和原始管道符。

3. **表格在工作台内横向滚动**。MarkdownText 内部的 `.tableScroll` 已经带
   `overflow-x: auto` 并按 ≥4 列自动套 `.md-table-wide` 钩子；工作台外层
   `.cangzhiMarkdown` 用 `--dsw-alias-*` token 复刻 DSH 配色，约束最大高度
   58vh，让垂直滚动仍归工作台主滚动条所有；表格本身用
   `width: max-content; min-width: 100%` 强制按内容撑开，配合
   `overflow-x: auto` 在工作台里出现横向滚动条。

4. **纯渲染辅助下沉到独立模块**。`src/client/lib/markdown-preview.mjs` 暴露：
   `byteLengthUtf8`（UTF-8 字节计数，**不再使用 Node `Buffer`**）、
   `normalizeEvidenceMarkdown`、`shouldRenderFormattedMarkdown`、
   `truncateEvidenceMarkdown`、`buildMarkdownLabels`，全部是字符串 / 长度
   运算，可被 `node --test` 直接 import 跑单测，不依赖 React 或 DSH 任何
   工作区包。
   - `byteLengthUtf8` 优先使用标准全局 `TextEncoder`（现代浏览器与
     Node ≥ 11 全部支持），在 `TextEncoder` 不可用时回退到 RFC 3629
     兼容的手写 UTF-8 计数器（包含代理对处理）。`Buffer` 在浏览器环境
     不存在，旧实现会让 `lib/client.js` 在点击任何带 `context_markdown`
     的证据时直接 `ReferenceError: Buffer is not defined`。该模块被
     `node --test` 加载时仍使用 `TextEncoder`（Node 全局可用），不依赖
     `Buffer`，因此 `Buffer.byteLength` 不再出现在浏览器 bundle 中。
   - 公开的 `__disableTextEncoderForTests` / `__restoreTextEncoderForTests`
     用于强制手写分支，确保 fallback 路径与 `Buffer.byteLength(text, 'utf8')`
     行为一致（已用 ASCII / 中文 / emoji / 代理对 / 混合字符验证）。
   - MarkdownText 的 `labels` prop 必须是引用稳定的对象（流式渲染用它做
     memo key），因此 `buildMarkdownLabels` 走模块级 memoize，并暴露
     `__resetMarkdownLabelsForTests` 供测试断言。

5. **依赖、bundle 与 manifest**：
   - `package.json` 新增 `peerDependencies: @deepseek-ai/dsh-client-ui-primitives`
     与对应 `peerDependenciesMeta` 的 `optional: true`，与既有 `ui-renderer`
     等 peer 写法一致。
   - `dsh.bundle.client.inject` 列表加入 `@deepseek-ai/dsh-client-ui-primitives`，
     与 DSH 的 platform 模块口径保持一致。
   - `tsdown` 客户端 bundle 的 purity gate 看到该 specifier 在平台模块白
     名单内，因此保持 `require(...)` 形式外置，不会把 shiki / katex 等打到
     我们的 lib/client.js。

6. **不引入新 Markdown 库、不写 unsafe HTML**。`MarkdownText` 自身不解析
   raw HTML，证据中的 `<script>` 之类会以字面文本形式出现；这正是我们想
   要的“不可信输入”防御。工作台 CSS 不增加任何 `innerHTML` 路径。

## 兼容与边界

- 旧 `<pre>` 仍然存在，作为用户主动选择的“原文”模式或空内容 fallback；点击行为、
  选中复制等不被破坏。
- 旧的“证据精确上下文 + 数据表 rows”双视图继续生效：数据表行渲染走
  `previewTable` / `rows` 路径，本轮没碰。
- 旧记录缺 `document_version_id` 时，工作台仍会显示“缺少版本信息”占位，
  这是 ADR-004 的语义，本轮保持不变。
- 唯一新增的运行时依赖是 `MarkdownText` 自身；shiki / katex / micromark 等
  体积大的依赖全部由 DSH 自身的 vendor CSS / 模块表承担，不进入本仓库
  `lib/client.js`。

## 验收

- 点击任一证据后，工作台的精确上下文区域出现带样式的标题、列表、强调、
  代码块与 GFM 表格；多列表格在工作台内出现横向滚动条而不是硬换行。
- “原文”按钮可切回 `<pre>` 显示，行为与之前一致；切到一条无法格式化的
  证据时仍能看到原文 `<pre>`，不会出现“已选 formatted 但实际空白”。
- 单元测试：`node --test tests/markdown-preview.test.mjs` 全绿，新增
  `byteLengthUtf8` 路径（含 TextEncoder 禁用后的手写 fallback）与 Node
  `Buffer.byteLength` 行为一致的对照断言。
- `tsdown` 构建产物 `lib/client.js` 中 `Buffer.byteLength` 不再出现，
  `require('@deepseek-ai/dsh-client-ui-primitives')` 仍以外置形式保留。
- `node --check lib/index.js && node --check lib/client.js` 通过；
  `git diff --check` 无冲突标记。
- 数据表预览（pagination / 行 / 列 / 滚动）行为不变；`cangzhi-evidence`
  Conversation Node 折叠逻辑不变。
- 超过 64 KiB 的 GFM 表格先截断到安全预算再格式化，表头和可容纳的行直接渲染为
  `<table>`；纯函数回归应在毫秒级完成，不能阻塞浏览器主线程。
