/**
 * dsh-openrouter-free — host half
 *
 * 自动识别 OpenRouter 免费模型 + 一键切换：
 *   free.list({refresh})  → 拉取 openrouter.ai/api/v1/models（公开，免密钥），
 *                           过滤 pricing.prompt==='0' && pricing.completion==='0'，
 *                           内存缓存 10 分钟。
 *   current()             → 读 agent-default-model 设置分节（当前对话模型）。
 *   use({id})             → 把该免费模型 upsert 进 llm-pi-ai.providers.openrouter.models
 *                           （保留所有非免费手工条目，如 ox-alpha 的精调条目），
 *                           再把 agent-default-model 指向它。settings 写入后
 *                           下一次请求即生效（llm-pi-ai 每操作重读 profile，无需重启）。
 *   syncAll()             → 全部免费模型一次装入选择器。
 *   removeFree({id})      → 从路由移除某个免费模型（当前选中者拒绝移除）。
 *
 * webServer route: /__orfree/api（client fetch）
 * 设计依据：packages/llm/llm-pi-ai/README.zh.md —— models 列表=替换该路由 catalog；
 * settings 分节更新即时生效；agent-default-model 是 GUI 模型选择器写的同一分节。
 */

export const name = 'dsh-openrouter-free'

// settings 用可选获取：服务缺席时 API 返回可读错误，不阻塞 bundle 树激活
export const inject = ['webServer']

const MODELS_URL = 'https://openrouter.ai/api/v1/models'
const ROUTE_NS = 'llm-pi-ai'
const DEFAULT_NS = 'agent-default-model'
const PROVIDER_KEY = 'openrouter'
const KEY_REF = 'OPENROUTER_API_KEY'
const CACHE_TTL_MS = 10 * 60 * 1000

// ---------- OpenRouter 模型 → DSH llm-pi-ai 条目映射 ----------

function mapModel(m) {
  if (!m || typeof m.id !== 'string') return null
  const pricing = m.pricing || {}
  // 免费判定：输入与输出单价均为 $0（OpenRouter 价格字段是字符串）
  if (!(String(pricing.prompt) === '0' && String(pricing.completion) === '0')) return null

  const mods = (m.architecture && m.architecture.input_modalities) || []
  const input = Array.isArray(mods) && mods.indexOf('image') >= 0 ? ['text', 'image'] : ['text']
  const sp = Array.isArray(m.supported_parameters) ? m.supported_parameters : []
  const reasoning = sp.indexOf('reasoning') >= 0
  const top = m.top_provider || {}
  const maxTokens = top.max_completion_tokens || undefined
  const contextWindow = m.context_length || undefined
  const displayName = m.name || m.id

  return {
    id: m.id,
    name: displayName,
    contextWindow: contextWindow,
    maxTokens: maxTokens,
    input: input,
    reasoning: reasoning,
    stealth: m.id.indexOf('stealth/') === 0,
    // 写入 llm-pi-ai providers.openrouter.models 的条目（仅 schema 认识的字段）。
    // reasoningEfforts 不声明 off：避免空值歧义，默认档位由 agent-default-model 给 high。
    entry: Object.assign(
      { id: m.id, name: displayName },
      contextWindow ? { contextWindow } : {},
      maxTokens ? { maxTokens } : {},
      { input },
      reasoning ? { reasoningEfforts: { low: 'low', medium: 'medium', high: 'high' } } : {}
    ),
  }
}

function fmtErr(error) {
  return String((error && error.message) || error)
}

// ---------- apply ----------

export function apply(ctx) {
  const web = ctx.get('webServer')
  if (!web) return

  let cache = null
  let fetchedAt = 0

  async function fetchFree(force) {
    if (!force && cache && Date.now() - fetchedAt < CACHE_TTL_MS) {
      return { rows: cache, cached: true, fetchedAt }
    }
    const res = await fetch(MODELS_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error('OpenRouter HTTP ' + res.status)
    const j = await res.json()
    const all = (j && j.data) || []
    const rows = []
    for (const m of all) {
      const row = mapModel(m)
      if (row) rows.push(row)
    }
    // stealth 置顶，其余按上下文窗口降序
    rows.sort((a, b) => {
      if (a.stealth !== b.stealth) return a.stealth ? -1 : 1
      return (b.contextWindow || 0) - (a.contextWindow || 0)
    })
    cache = rows
    fetchedAt = Date.now()
    return { rows, cached: false, fetchedAt }
  }

  function settingsSvc() {
    const s = ctx.get('settings')
    if (!s) throw new Error('settings 服务不可用（本插件需要 settings seam）')
    return s
  }

  function readRouteModels() {
    try {
      const section = ctx.get('settings') ? ctx.get('settings').get(ROUTE_NS) : null
      const prov = section && section.providers && section.providers[PROVIDER_KEY]
      return Array.isArray(prov && prov.models) ? prov.models.slice() : []
    } catch {
      return []
    }
  }

  function readDefault() {
    try {
      const d = ctx.get('settings') ? ctx.get('settings').get(DEFAULT_NS) : null
      return d && typeof d === 'object'
        ? { provider: d.provider || '', model: d.model || '', reasoningEffort: d.reasoningEffort }
        : {}
    } catch {
      return {}
    }
  }

  const api = {
    async 'free.list'(args) {
      const { rows, cached, fetchedAt } = await fetchFree(Boolean(args && args.refresh))
      return {
        ok: true,
        count: rows.length,
        cached,
        fetchedAt,
        models: rows.map((r) => ({
          id: r.id,
          name: r.name,
          contextWindow: r.contextWindow,
          maxTokens: r.maxTokens,
          input: r.input,
          reasoning: r.reasoning,
          stealth: r.stealth,
        })),
      }
    },

    current() {
      return { ok: true, default: readDefault(), installedIds: readRouteModels().map((e) => e && e.id).filter(Boolean) }
    },

    async 'model.use'(args) {
      const id = String((args && args.id) || '')
      if (!id) throw new Error('missing id')
      const { rows } = await fetchFree(false)
      const row = rows.find((r) => r.id === id)
      if (!row) throw new Error('不是免费模型或清单里没有它：' + id)

      const s = settingsSvc()
      const models = readRouteModels()
      const next = models.filter((e) => !(e && e.id === id))
      next.push(row.entry)
      await s.update(ROUTE_NS, { providers: { [PROVIDER_KEY]: { models: next } } })

      // 选一个该模型真正支持的推理档：mapModel 给推理模型只声明 {low,medium,high}
      // （无 max），故从高到低试 resolveCallConfig 挑第一个通过的档；非推理模型直接
      // 省略 reasoningEffort（设任何档都会触发 UNSUPPORTED_REASONING_EFFORT）。
      const llm = ctx.get('llm')
      const candidates = row.reasoning ? ['high', 'medium', 'low'] : [undefined]
      let chosenEffort
      let resolvedOk = false
      if (llm && typeof llm.resolveCallConfig === 'function') {
        for (const eff of candidates) {
          const cfg = { provider: PROVIDER_KEY, model: id }
          if (eff !== undefined) cfg.reasoningEffort = eff
          try { await llm.resolveCallConfig(cfg); chosenEffort = eff; resolvedOk = true; break } catch { /* 试下一档 */ }
        }
        if (!resolvedOk) throw new Error('模型预校验失败（未切换）：openrouter/' + id + ' 无法解析为可用调用配置')
      } else {
        chosenEffort = row.reasoning ? 'high' : undefined
      }
      const selected = { provider: PROVIDER_KEY, model: id }
      if (chosenEffort !== undefined) selected.reasoningEffort = chosenEffort
      await s.replace(DEFAULT_NS, selected)

      // 会话级同步：已有请求历史的会话，其模型锁在会话投影（modelSelection
      // 事件）里，只改全局默认对该会话无效。原生底部选择器走的是
      // sessionController.selectModel（commands.ts L118）= resolveAgent（含冷会话
      // resume）→ selectForNextRequest（写 model/selection 会话事件 + 内存
      // selection 双写）→ agentDefaultModel.saveSelection。
      // ⚠️ 不能用 ctx.get('agents').selectForNextRequest —— 公开的 agents 服务是
      // core/agent 的 AgentRegistry（只有 get/list/create/resume…），
      // selectForNextRequest 在 session-controller 的内部类
      // ApiSessionAgentController 上，不在任何公开服务接口里（2026-09-03 问题一
      // 根因：v0.2.1 调了这个不存在的幻影 API，会话级那一笔从未落地）。
      // 这里直调 sessionController.selectModel 公开方法，与原生切换行为完全一致。
      const sessionId = String((args && args.sessionId) || '')
      let sessionApplied = false
      let sessionNote = ''
      if (sessionId) {
        const controller = ctx.get('sessionController')
        if (controller && typeof controller.selectModel === 'function') {
          try {
            await controller.selectModel(Object.assign({ sessionId: sessionId }, selected))
            sessionApplied = true
          } catch (error) {
            sessionNote = '会话级写入失败，已改全局默认（该会话请用底部模型选择器重选一次）：' + fmtErr(error)
          }
        } else {
          sessionNote = 'sessionController 服务不可用，仅改全局默认'
        }
      } else {
        sessionNote = '未收到会话 id（前端未取到 sessionId），仅改全局默认'
      }

      return {
        ok: true,
        applied: selected,
        installedCount: next.length,
        sessionApplied,
        sessionIdSeen: sessionId !== '',
        ...(sessionNote ? { note: sessionNote } : { note: '下一次请求即生效，无需重启' }),
      }
    },

    // ---------- OpenRouter API Key（免费模型也必须带 key 认证） ----------

    async 'key.status'() {
      const cred = ctx.get('credentials')
      if (!cred) throw new Error('credentials 服务不可用')
      const info = await cred.describe(KEY_REF)
      return { ok: true, configured: info.configured === true, source: info.source, writable: info.writable !== false }
    },

    async 'key.set'(args) {
      const value = String((args && args.key) || '').trim()
      if (!value) throw new Error('key 为空')
      if (!/^[\x21-\x7E]+$/.test(value)) throw new Error('key 含非法字符（只允许可见 ASCII）')
      if (value.length < 20) throw new Error('key 太短，不像有效的 API Key')
      const cred = ctx.get('credentials')
      if (!cred) throw new Error('credentials 服务不可用')
      await cred.set(KEY_REF, value)
      return { ok: true, note: 'OPENROUTER_API_KEY 已写入凭据库，下一次请求即生效' }
    },

    async 'key.unset'() {
      const cred = ctx.get('credentials')
      if (!cred) throw new Error('credentials 服务不可用')
      await cred.unset(KEY_REF)
      return { ok: true }
    },

    async 'sync.all'() {
      const { rows } = await fetchFree(false)
      if (!rows.length) throw new Error('免费清单为空')
      const s = settingsSvc()
      const models = readRouteModels()
      const freeIds = new Set(rows.map((r) => r.id))
      // 非免费的手工条目原样保留（如 ox-alpha 精调条目），免费条目整体刷新
      const keptManual = models.filter((e) => !(e && typeof e.id === 'string' && freeIds.has(e.id)))
      const entries = rows.map((r) => r.entry)
      await s.update(ROUTE_NS, { providers: { [PROVIDER_KEY]: { models: keptManual.concat(entries) } } })
      return { ok: true, installedCount: entries.length, keptManual: keptManual.length, note: '已全部装入模型选择器' }
    },

    async 'free.remove'(args) {
      const id = String((args && args.id) || '')
      if (!id) throw new Error('missing id')
      const def = readDefault()
      if (def.model === id) throw new Error('该模型是当前对话模型，请先切换到别的模型再移除')
      const s = settingsSvc()
      const models = readRouteModels()
      const next = models.filter((e) => !(e && e.id === id))
      if (next.length === models.length) throw new Error('路由中没有这个模型：' + id)
      await s.update(ROUTE_NS, { providers: { [PROVIDER_KEY]: { models: next } } })
      return { ok: true, installedCount: next.length }
    },
  }

  // host-auth 只包 /api 前缀，自定义前缀须自建 loopback 围栏
  //（本端点可改凭据，绝不能对局域网开放）。
  function isLoopback(req) {
    const addr = String((req.socket && req.socket.remoteAddress) || '')
    return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'
  }

  function handle(req, res) {
    if (!isLoopback(req)) {
      res.writeHead(403, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: 'loopback only' }))
      return
    }
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      let payload = {}
      try { payload = JSON.parse(body || '{}') } catch { /* ignore */ }
      const method = String((payload && payload.method) || '')
      const fn = api[method]
      if (!fn) {
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: 'unknown method ' + method }))
        return
      }
      Promise.resolve(fn((payload && payload.args) || {})).then((result) => {
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' })
        res.end(JSON.stringify(result))
      }).catch((error) => {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: fmtErr(error) }))
      })
    })
  }

  ctx.effect(() => web.register({ kind: 'prefix', path: '/__orfree', handler: handle }))
}
