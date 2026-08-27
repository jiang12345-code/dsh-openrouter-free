window.__ModuleLoader__.load({
  id: 'dsh-openrouter-free',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    var CSS = ''
      + '.orf-wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e6edf3;background:#0d1117;padding:16px 20px;height:100%;display:flex;flex-direction:column;gap:12px;min-height:0;}'
      + '.orf-top{display:flex;align-items:center;justify-content:space-between;flex:none;}'
      + '.orf-brand{display:flex;align-items:center;gap:8px;}'
      + '.orf-dot{width:8px;height:8px;border-radius:50%;background:#3fb950;box-shadow:0 0 8px rgba(63,185,80,.6);}'
      + '.orf-title{font-size:13px;font-weight:600;}'
      + '.orf-sub{font-size:11px;color:#8b949e;margin-left:4px;}'
      + '.orf-actions{display:flex;gap:8px;align-items:center;}'
      + '.orf-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#161b22;border:1px solid #30363d;border-radius:8px;color:#e6edf3;font-size:12px;cursor:pointer;transition:all .15s;}'
      + '.orf-btn:hover{background:#1c2128;border-color:#484f58;}'
      + '.orf-btn:disabled{opacity:.5;cursor:default;}'
      + '.orf-btn.primary{background:#238636;border-color:#2ea043;}'
      + '.orf-btn.primary:hover{background:#2ea043;}'
      + '.orf-btn svg{width:13px;height:13px;}'
      + '.orf-cur{flex:none;display:flex;align-items:center;gap:10px;padding:9px 14px;background:#161b22;border:1px solid #30363d;border-radius:10px;font-size:12px;}'
      + '.orf-cur-label{color:#8b949e;}'
      + '.orf-cur-model{font-family:"JetBrains Mono",monospace;color:#58a6ff;font-weight:600;}'
      + '.orf-cur-effort{color:#d29922;font-family:"JetBrains Mono",monospace;font-size:11px;}'
      + '.orf-toolbar{display:flex;gap:10px;align-items:center;flex:none;}'
      + '.orf-search{flex:1;max-width:360px;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:8px 12px;font-size:12px;color:#e6edf3;outline:none;}'
      + '.orf-search:focus{border-color:rgba(88,166,255,.5);}'
      + '.orf-meta{font-size:11px;color:#484f58;font-family:"JetBrains Mono",monospace;}'
      + '.orf-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px;min-height:0;padding-right:4px;}'
      + '.orf-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#161b22;border:1px solid #21262d;border-radius:10px;cursor:pointer;transition:all .12s;}'
      + '.orf-row:hover{background:#1c2128;border-color:#30363d;}'
      + '.orf-row.active{border-color:rgba(63,185,80,.55);background:rgba(63,185,80,.08);}'
      + '.orf-row.switching{opacity:.6;pointer-events:none;}'
      + '.orf-row-main{flex:1;min-width:0;}'
      + '.orf-row-name{font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;}'
      + '.orf-star{color:#bc8cff;font-size:11px;}'
      + '.orf-row-id{font-family:"JetBrains Mono",monospace;font-size:11px;color:#8b949e;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.orf-badges{display:flex;gap:6px;flex:none;}'
      + '.orf-badge{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;border:1px solid transparent;}'
      + '.orf-badge.ctx{background:rgba(88,166,255,.12);color:#58a6ff;border-color:rgba(88,166,255,.25);font-family:"JetBrains Mono",monospace;}'
      + '.orf-badge.img{background:rgba(188,140,255,.12);color:#bc8cff;border-color:rgba(188,140,255,.25);}'
      + '.orf-badge.think{background:rgba(210,153,34,.12);color:#d29922;border-color:rgba(210,153,34,.25);}'
      + '.orf-badge.use{background:rgba(63,185,80,.15);color:#3fb950;border-color:rgba(63,185,80,.35);}'
      + '.orf-note{flex:none;display:flex;align-items:center;gap:8px;font-size:11px;color:#484f58;}'
      + '.orf-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1c2128;border:1px solid #2ea043;color:#3fb950;padding:9px 18px;border-radius:10px;font-size:12px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.5);}'
      + '.orf-toast.err{border-color:#f85149;color:#f85149;}'
      + '.orf-empty{padding:40px;text-align:center;color:#484f58;font-size:13px;}'
      + '.orb-spin{animation:orfSpin 1s linear infinite;}@keyframes orfSpin{to{transform:rotate(360deg)}}'

    function injectStyles(css) {
      if (typeof document === 'undefined') return
      var el = document.createElement('style')
      el.setAttribute('data-orf', 'style')
      el.textContent = css
      document.head.appendChild(el)
      return function () { el.remove() }
    }

    function api(method, args) {
      return fetch('/__orfree/api', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method: method, args: args || {} }),
      }).then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok || j.ok === false) throw new Error(j && j.error ? j.error : 'HTTP ' + r.status)
          return j
        })
      })
    }

    function fmtCtx(n) {
      if (!n) return '—'
      if (n >= 1000000) return (Math.round(n / 100000) / 10) + 'M'
      if (n >= 1000) return Math.round(n / 1000) + 'K'
      return String(n)
    }

    function IcRefresh(p) {
      return React.createElement('svg', { width: 13, height: 13, viewBox: '0  0 16 16', fill: 'currentColor', className: p && p.spin ? 'orb-spin' : '' },
        React.createElement('path', { d: 'M8 3a5 5 0 1 0 4.9 6h1.55A6.5 6.5 0 1 1 13.7 3.7L16 6h-5V1l1.8 1.8A5 5 0 0 0 8 3z' }))
    }
    function IcDownload() {
      return React.createElement('svg', { width: 13, height: 13, viewBox: '0  0 16 16', fill: 'currentColor' },
        React.createElement('path', { d: 'M8 1v8.6L5 6.5 3.9 7.6 8 11.7l4.1-4.1L11 6.5 8 9.6V1H8zM2 13h12v1.5H2V13z' }))
    }

    function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      ctx.effect(() => injectStyles(CSS))
      slots.inject('conversation.view', () => slots.register(
        { name: 'conversation.view', id: 'dsh-openrouter-free', label: '免费模型', order: 9 },
        (props) => {
          function Panel() {
            const [models, setModels] = React.useState(null)
            const [cur, setCur] = React.useState(null)
            const [loading, setLoading] = React.useState(true)
            const [error, setError] = React.useState('')
            const [toast, setToast] = React.useState('')
            const [query, setQuery] = React.useState('')
            const [refreshing, setRefreshing] = React.useState(false)
            const [switching, setSwitching] = React.useState('')

            function showToast(msg, isErr) { setToast({ msg: msg, err: !!isErr }); setTimeout(() => setToast(''), 2600) }
            function loadCurrent() { api('current').then(j => setCur(j.default || {})).catch(() => {}) }
            function loadList(refresh) {
              setRefreshing(true); if (refresh) setError('')
              api('free.list', { refresh: !!refresh })
                .then(j => setModels(j.models || []))
                .catch(e => setError(String(e.message || e)))
                .then(() => { setRefreshing(false); setLoading(false); })
            }
            React.useEffect(() => { loadCurrent(); loadList(false) }, [])

            function switchTo(m) {
              setSwitching(m.id); setError('')
              api('model.use', { id: m.id })
                .then(j => { showToast('已切换 → ' + m.id + '（下一次请求生效）'); return loadCurrent() })
                .catch(e => { setError(String(e.message || e)); showToast(String(e.message || e), true) })
                .then(() => setSwitching(''))
            }
            function syncAll() {
              setSwitching('__all__')
              api('sync.all')
                .then(j => { showToast('已把 ' + j.installedCount + ' 个免费模型装入选择器'); return loadCurrent() })
                .catch(e => { showToast(String(e.message || e), true) })
                .then(() => setSwitching(''))
            }

            const list = (models || []).filter(function (m) {
              if (!query) return true
              return (m.id + ' ' + m.name).toLowerCase().indexOf(query.toLowerCase()) >= 0
            })
            list.sort(function (a, b) {
              var score = function (m) { return (m.contextWindow || 0) / 1048576 * 100 + (m.reasoning ? 50 : 0) + (m.input && m.input.indexOf('image') >= 0 ? 10 : 0) + (m.stealth ? 10 : 0) }
              return score(b) - score(a)
            })

            const activeId = cur && cur.model ? cur.model : ''

            const header = React.createElement('div', { className: 'orf-top' },
              React.createElement('div', { className: 'orf-brand' },
                React.createElement('span', { className: 'orf-dot' }),
                React.createElement('span', { className: 'orf-title' }, 'OpenRouter 免费模型'),
                React.createElement('span', { className: 'orf-sub' }, models ? (models.length + ' 个可用 · $0 输入/$0 输出') : '')),
              React.createElement('div', { className: 'orf-actions' },
                React.createElement('button', { className: 'orf-btn', onClick: () => loadList(true), disabled: refreshing, title: '重新拉取 OpenRouter 免费清单' },
                  React.createElement(IcRefresh, { spin: refreshing }), refreshing ? '刷新中…' : '刷新清单'),
                React.createElement('button', { className: 'orf-btn primary', onClick: syncAll, disabled: switching === '__all__' || !models },
                  React.createElement(IcDownload), '全部装进选择器')))

            const curBar = React.createElement('div', { className: 'orf-cur' },
              React.createElement('span', { className: 'orf-cur-label' }, '当前对话模型'),
              React.createElement('span', { className: 'orf-cur-model' }, (cur && cur.model) || '（未设置）'),
              cur && cur.reasoningEffort ? React.createElement('span', { className: 'orf-cur-effort' }, '推理档 ' + cur.reasoningEffort) : null,
              React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, color: '#484f58' } }, 'provider: ' + ((cur && cur.provider) || 'openrouter')))

            const toolbar = React.createElement('div', { className: 'orf-toolbar' },
              React.createElement('input', { className: 'orf-search', placeholder: '搜索模型名 / 厂商…', value: query, onChange: (e) => setQuery(e.target.value) }),
              React.createElement('span', { className: 'orf-meta' }, '显示 ' + list.length + ' / ' + (models ? models.length : 0)))

            function makeRow(m) {
              const isActive = activeId === m.id
              const s = (m.contextWindow || 0) / 1048576 * 100 + (m.reasoning ? 50 : 0) + (m.input && m.input.indexOf('image') >= 0 ? 10 : 0) + (m.stealth ? 10 : 0)
              const stars = Math.max(1, Math.min(5, Math.round(s / 20)))
              return React.createElement('div', {
                key: m.id,
                className: 'orf-row' + (isActive ? ' active' : '') + (switching === m.id ? ' switching' : ''),
                onClick: () => { if (!isActive) switchTo(m) },
                title: isActive ? '当前对话模型' : '点击切换到 ' + m.id,
              },
                React.createElement('div', { className: 'orf-row-main' },
                  React.createElement('div', { className: 'orf-row-name' },
                    m.name,
                    React.createElement('span', { className: 'orf-star', title: '综合评分 ' + stars + '★ (上下文+推理+图片+热门)' }, Array(stars + 1).join('★')),
                    React.createElement('div', { className: 'orf-row-id' }, m.id)
                  ),
                  React.createElement('div', { className: 'orf-badges' },
                    isActive ? React.createElement('span', { className: 'orf-badge use' }, '✓ 使用中') : null,
                    m.reasoning ? React.createElement('span', { className: 'orf-badge think' }, '🧠 推理') : null,
                    m.input && m.input.indexOf('image') >= 0 ? React.createElement('span', { className: 'orf-badge img' }, '🖼 图片') : null,
                    React.createElement('span', { className: 'orf-badge ctx' }, fmtCtx(m.contextWindow))
                  )
                )
              )
            }

            const rows = list.map(makeRow)

            const body = loading
              ? React.createElement('div', { className: 'orf-empty' }, '正在拉取 OpenRouter 免费清单…')
              : error
                ? React.createElement('div', { className: 'orf-empty', style: { color: '#f85149' } }, '出错了：' + error)
                : list.length ? React.createElement('div', { className: 'orf-list' }, rows) : React.createElement('div', { className: 'orf-empty' }, '没有匹配的免费模型')

            const toastEl = toast ? React.createElement('div', { className: 'orf-toast' + (toast.err ? ' err' : '') }, toast.msg) : null

            return React.createElement('div', { className: 'orf-wrap' }, header, curBar, toolbar, body,
              React.createElement('div', { className: 'orf-note' }, '💡 点击任意行立即切换为对话模型（免重启）；“全部装进选择器”把所有免费模型写入 openrouter 路由。免费模型有平台速率限制。'),
              toastEl
            )
          }
          return React.createElement(Panel, props)
        })
      )
    }

    exports.apply = apply
    return module.exports
  },
})
