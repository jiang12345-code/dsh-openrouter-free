# dsh-openrouter-free

[![CI](https://github.com/jiang12345-code/dsh-openrouter-free/actions/workflows/ci.yml/badge.svg)](https://github.com/jiang12345-code/dsh-openrouter-free/actions/workflows/ci.yml)
![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin-8b5cf6)
[![npm](https://img.shields.io/npm/v/dsh-openrouter-free)](https://www.npmjs.com/package/dsh-openrouter-free)

OpenRouter 免费模型面板（DeepSeek Harness / DSH 持久插件）。特性：**综合能力 1-5★ 分级标星 · 最优三优先排序 · 一键切换（会话级 + 全局双写，推理档自动预校验）**。

自动拉取 [openrouter.ai](https://openrouter.ai/api/v1/models) 的实时免费模型清单（输入/输出单价均为 $0），一键安装进本机 `openrouter` 路由并设为当前对话模型——免去手动编辑 `settings.yaml` 配置模型的麻烦。

## 功能

- **免费清单面板**：GUI 会话视图新增「免费模型」标签页，实时列出 OpenRouter 全部免费模型（名称 / ID / 上下文窗口 / 是否支持图片与推理），10 分钟内存缓存，可手动强刷。
- **一键切换（会话级 + 全局双写）**：点击任意行 → 该模型被 upsert 进 `llm-pi-ai.providers.openrouter.models`，同时经原生 `sessionController.selectModel()` 写入**当前会话**的模型选择并更新 `agent-default-model`。**下一次请求即生效，无需重启**（对有请求历史的会话，只改全局默认不够——三层优先级 pending→lastUsed→default 会压住它）。
- **推理档自动预校验**：切换时从高到低试选该模型真正支持的档位（low/medium/high）；不支持推理的模型自动摘掉 `reasoningEffort`，避免请求以 `UNSUPPORTED_REASONING_EFFORT` 失败。
- **凭据面板**：内置 OpenRouter API Key 设置入口，缺密钥时直接提示补填。
- **全部装进选择器**：一次把所有免费模型写入路由，之后也能用 DSH 自带模型选择器切换。
- **安全保留手工条目**：同步/切换单个模型时，所有非免费的手工条目（如 `stealth/ox-alpha` 的精调条目）原样保留；「全部装进选择器」也只刷新免费条目。

## 前置条件

- 本机 `settings.yaml` 已有 `llm-pi-ai.providers.openrouter` 路由（`baseURL: https://openrouter.ai/api/v1`）+ 环境变量 `OPENROUTER_API_KEY`（使用免费模型也需要密钥）。
- 拉取清单本身是公开 API，无需密钥。

## 安装

```powershell
# 源码在本仓库；把包复制进运行中的 profile 并注册 bundle
Copy-Item -Recurse -Force . "C:\Users\73618\.dsh\profiles\web\node_modules\dsh-openrouter-free"
# 在 profile 的 package.json 里给 dsh.profile.bundles 追加 "dsh-openrouter-free"
# 然后重启 DSH（host 改动需重启；client 改动硬刷新即可）
```

## HTTP API（POST /__orfree/api，body: {method, args}）

| method | 说明 |
|---|---|
| `free.list({refresh})` | 免费清单（缓存 10 分钟，refresh 强刷） |
| `current()` | 当前 agent-default-model 与已装入的模型 id 列表 |
| `model.use({id})` | 安装单个免费模型并设为当前对话模型 |
| `sync.all()` | 全部免费模型装入 openrouter 路由 |
| `free.remove({id})` | 移除某个免费模型（当前选中者拒绝） |

## 设计依据

- DSH llm-pi-ai 适配器的 `models` 列表即"替换该路由 catalog"，且 settings 分节更新在下一次请求生效、无需重启（见 `packages/llm/llm-pi-ai/README.zh.md`）。
- 该适配器明确声明"路由的 catalog 不会自我刷新"——本插件就是补上这个自动化缺口。

## License

MIT
