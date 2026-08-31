# 协作规范

本仓库是藏知面向 DeepSeek Harness（DSH）的适配器。代码、构建产物和协作文档都在本仓库内维护；不要把项目上下文只留在聊天记录中。

## 开始任务前

1. 阅读本文件、`PROJECT_STATUS.md` 和相关 `docs/adr/`。
2. 检查 `git status`，保留其他人的未提交修改，不使用破坏性回滚。
3. 确认任务的验收标准、影响范围和是否需要更新文档。

## 协作角色

- 项目经理 / 集成：负责拆分任务、协调模型、最终验收和兜底。
- Ark：优先负责前端或功能实现，并报告改动文件、测试和未完成事项。
- MiniMax M3：负责第二轮审查、边界检查、构建验证和必要修复。
- 所有参与者：不得覆盖未确认的并行修改；重要设计取舍必须写入 ADR。

## 开发流程

1. 在 `PROJECT_STATUS.md` 登记任务为“进行中”，写明负责人和验收标准。
2. 实现代码时同步考虑测试、迁移、接口文档和运行状态。
3. 完成后运行与风险匹配的验证，至少记录构建和语法检查结果。
4. 重要节点追加 `DEVLOG.md`，历史日志只追加不改写。
5. 架构、API、权限、数据隔离或用户可见语义变化时新增 ADR。
6. 合并或交付前同步 `PROJECT_STATUS.md`，避免状态文档落后于代码。

## 本项目验证

本地构建需要复用 DSH 源码中的 preset：

```bash
DSH_SOURCE=/path/to/deepseek-harness
"$DSH_SOURCE/node_modules/.bin/tsdown" --config tsdown.config.ts
node scripts/rewrite-client-id.mjs
npm run check
```

开发启动使用 `scripts/start-dev-dsh.sh`。不要在未确认端口归属前杀掉正在运行的 DSH；优先使用临时端口验证。

## 文档职责

- `PROJECT_STATUS.md`：唯一的当前状态文件。
- `DEVLOG.md`：按时间追加的开发记录。
- `docs/adr/`：经过讨论的长期设计决策。
- `HANDOFF.md`：兼容旧入口，内容不得另行维护。
