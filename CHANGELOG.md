# Changelog

## v0.2.2 — 2026-09-03（会话级双写修复）

- **修复：会话内切换模型不生效**。v0.2.1 的会话级双写调用了 `ctx.get('agents').selectForNextRequest()`——该公开服务（AgentRegistry）根本没有这个方法，调用静默失败（幻影 API），模型只在下一轮新会话生效。
- `model.use` 改走原生选择器同一公开方法 `sessionController.selectModel({sessionId, provider, model, reasoningEffort?})`：内部含冷会话 resume、resolveCallConfig 校验、`model/selection` 事件双写与 saveSelection，与底部模型选择器行为完全一致。
- 响应自证三字段 `sessionApplied` / `note` / `sessionIdSeen`，可观测断点在前端还是后端；sessionController 不可用或写入失败时优雅降级为仅改全局默认并给出提示文案。
- 新增回归测试 `test-orfree-model-use.mjs`（热会话应用 / 控制器缺席 / 裸控制器 / selectModel 抛错 / 无 sessionId 五场景）。

## v0.2.1 — 2026-09-02（凭据面板 + 推理档预校验）

- 内置 OpenRouter API Key 凭据面板：缺密钥时直接提示补填，无需手动编辑 settings.yaml。
- 推理档自动预校验：切换时从高到低试选该模型真正支持的档位（low/medium/high）；不支持推理的模型自动摘掉 `reasoningEffort`，避免 `UNSUPPORTED_REASONING_EFFORT` 请求失败。
- 尝试引入会话级双写（对当前会话即时应用所选模型）——因幻影 API 实际未生效，由 v0.2.2 修正。
- loopback 安全围栏加固。

## v0.2.0 — 2026-08-27（首发）

- OpenRouter 免费模型面板：实时拉取 `openrouter.ai/api/v1/models` 过滤全免费模型（输入/输出单价均为 $0），GUI「免费模型」标签页一键切换。
- 综合能力 1-5★ 分级标星 + 最优三优先排序；上下文窗口 / 图片 / 推理能力标注。
- upsert 进 `llm-pi-ai.providers.openrouter.models` 并同步 `agent-default-model`，下一次请求即生效、无需重启。
- 「全部装进选择器」：一次把全部免费模型装入路由；非免费手工条目原样保留。
- 10 分钟内存缓存 + 手动强刷；`free.remove` 移除单个免费模型（当前选中者拒绝）。
