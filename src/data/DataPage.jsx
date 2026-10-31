import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { SectionHeader, Output, numberParam } from '../ui.jsx'

const formatSalary = n => '$' + n.toLocaleString('en-US')

// ─── D1. Sortable table with inline edit and expandable rows ─────────────────
const EMPLOYEES = [
  { id: 1, name: 'Priya Nair',    dept: 'Engineering', start: '2021-03-15', salary: 98000,  note: 'Leads the payments squad. Based in Bengaluru.' },
  { id: 2, name: 'Marcus Lee',    dept: 'Marketing',   start: '2019-07-01', salary: 72000,  note: 'Owns the Q4 campaign calendar.' },
  { id: 3, name: 'Sofia Rossi',   dept: 'Finance',     start: '2023-01-09', salary: 81000,  note: 'Runs month-end close.' },
  { id: 4, name: 'Daniel Okafor', dept: 'Sales',       start: '2020-11-23', salary: 67000,  note: 'Top closer in EMEA for 2025.' },
  { id: 5, name: 'Hana Sato',     dept: 'Engineering', start: '2018-05-30', salary: 112000, note: 'Staff engineer on the platform team.' },
  { id: 6, name: 'Elena García',  dept: 'HR',          start: '2022-09-12', salary: 64000,  note: 'Coordinates onboarding.' },
  { id: 7, name: 'Omar Haddad',   dept: 'Sales',       start: '2024-02-05', salary: 59000,  note: 'Covers accounts in the Gulf region.' },
  { id: 8, name: 'Chloe Martin',  dept: 'Marketing',   start: '2017-10-16', salary: 88000,  note: 'Heads brand and design.' },
]
const TABLE_COLUMNS = [
  { key: 'name',   labelKey: 'dataColName' },
  { key: 'dept',   labelKey: 'dataColDept' },
  { key: 'start',  labelKey: 'dataColStart' },
  { key: 'salary', labelKey: 'dataColSalary', numeric: true },
]
const MAX_SALARY = 1000000

function compareBy(key) {
  return (a, b) => key === 'salary' ? a.salary - b.salary : String(a[key]).localeCompare(String(b[key]))
}

function SortableTableSection() {
  const { t } = useLang()
  const [rows, setRows]         = useState(EMPLOYEES)
  const [sort, setSort]         = useState({ key: null, dir: 'ascending' })
  const [expanded, setExpanded] = useState(() => new Set())
  const [editing, setEditing]   = useState(null)  // { id, value }
  const [error, setError]       = useState('')
  const [status, setStatus]     = useState({ key: 'dataSortNone' })  // translated at render

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const list = [...rows].sort(compareBy(sort.key))
    return sort.dir === 'descending' ? list.reverse() : list
  }, [rows, sort])

  const sortBy = col => {
    const dir = sort.key === col.key && sort.dir === 'ascending' ? 'descending' : 'ascending'
    setSort({ key: col.key, dir })
    setStatus({ key: 'dataSortedBy', col: col.labelKey, dir })
  }

  const toggleRow = id => setExpanded(s => {
    const next = new Set(s)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const startEdit = row => { setEditing({ id: row.id, value: String(row.salary) }); setError('') }
  const cancelEdit = () => { setEditing(null); setError(''); setStatus({ key: 'dataEditCancelled' }) }
  const saveEdit = ({ cancelIfInvalid } = {}) => {
    const value = Number(editing.value)
    if (!/^\d+$/.test(editing.value.trim()) || value <= 0 || value > MAX_SALARY) {
      if (cancelIfInvalid) return cancelEdit()
      setError('dataSalaryInvalid')
      return
    }
    const row = rows.find(r => r.id === editing.id)
    setRows(rs => rs.map(r => (r.id === editing.id ? { ...r, salary: value } : r)))
    setEditing(null)
    setError('')
    setStatus({ key: 'dataSalarySaved', name: row.name, salary: formatSalary(value) })
  }

  const reset = () => {
    setRows(EMPLOYEES); setSort({ key: null, dir: 'ascending' }); setExpanded(new Set())
    setEditing(null); setError(''); setStatus({ key: 'dataSortNone' })
  }

  return (
    <section id="sec-data-table" className="card media-wide"
      data-sort-key={sort.key || ''} data-sort-dir={sort.key ? sort.dir : ''}>
      <SectionHeader num="D1" title={t('secD1Title')} locator="aria-sort / data-row-id" />
      <p className="desc">{t('secD1Desc')}</p>
      <div className="table-wrap">
        <table id="data-table">
          <thead>
            <tr>
              <th className="data-expand-col" aria-label={t('dataColDetails')} />
              {TABLE_COLUMNS.map(col => (
                <th key={col.key} data-key={col.key} className={col.numeric ? 'data-num' : ''}
                  aria-sort={sort.key === col.key ? sort.dir : 'none'}>
                  <button id={`sort-${col.key}`} className="data-sort-btn" onClick={() => sortBy(col)}>
                    {t(col.labelKey)}
                    <span className="data-sort-icon" aria-hidden>
                      {sort.key !== col.key ? '↕' : sort.dir === 'ascending' ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => {
              const open = expanded.has(row.id)
              const isEditing = editing?.id === row.id
              return [
                <tr key={row.id} data-row-id={row.id}>
                  <td className="data-expand-col">
                    <button className="data-expand-btn" data-testid={`row-expand-${row.id}`}
                      aria-expanded={open} aria-controls={`row-detail-${row.id}`}
                      aria-label={t('dataRowDetails', { name: row.name })} onClick={() => toggleRow(row.id)}>
                      {open ? '▾' : '▸'}
                    </button>
                  </td>
                  <td data-col="name" className="cell-name">{row.name}</td>
                  <td data-col="dept" className="cell-dept">{row.dept}</td>
                  <td data-col="start">{row.start}</td>
                  <td data-col="salary" className="data-num" data-editable="true" data-value={row.salary}
                    title={t('dataEditHint')} onDoubleClick={() => !isEditing && startEdit(row)}>
                    {isEditing ? (
                      <input id={`salary-edit-${row.id}`} className="data-cell-input" type="text"
                        inputMode="numeric" autoFocus aria-label={t('dataSalaryFor', { name: row.name })}
                        aria-invalid={!!error} value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        onBlur={() => saveEdit({ cancelIfInvalid: true })} />
                    ) : formatSalary(row.salary)}
                  </td>
                </tr>,
                open && (
                  <tr key={`${row.id}-detail`} id={`row-detail-${row.id}`} className="data-detail-row"
                    data-detail-for={row.id}>
                    <td />
                    <td colSpan={4}>{row.note}</td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>
      </div>
      {error && <p id="data-table-error" className="error-msg" role="alert">{t(error, { max: formatSalary(MAX_SALARY) })}</p>}
      <div className="button-row">
        <button id="data-table-reset" className="btn-secondary" onClick={reset}>{t('dataReset')}</button>
      </div>
      <Output id="data-table-status">
        {status.key === 'dataSortedBy'
          ? t('dataSortedBy', { col: t(status.col), dir: t(status.dir === 'ascending' ? 'dataAsc' : 'dataDesc') })
          : t(status.key, status)}
      </Output>
    </section>
  )
}

// ─── D2. Tree view with checkboxes ───────────────────────────────────────────
const TEST_TREE = {
  name: 'test-suite',
  children: [
    { name: 'auth', children: [{ name: 'login.spec.ts' }, { name: 'signup.spec.ts' }, { name: 'logout.spec.ts' }] },
    { name: 'petstore', children: [{ name: 'create-pet.spec.ts' }, { name: 'delete-pet.spec.ts' }] },
    { name: 'media', children: [{ name: 'video.spec.ts' }, { name: 'carousel.spec.ts' }] },
  ],
}

function withPaths(node, parent = '') {
  const path = parent ? `${parent}/${node.name}` : node.name
  return { ...node, path, children: node.children?.map(c => withPaths(c, path)) }
}
const TREE = withPaths(TEST_TREE)
const leavesOf = node => (node.children ? node.children.flatMap(leavesOf) : [node.path])
const foldersOf = node => (node.children ? [node.path, ...node.children.flatMap(foldersOf)] : [])
const ALL_LEAVES  = leavesOf(TREE)
const ALL_FOLDERS = foldersOf(TREE)
const pathId = path => 'tree-' + path.replace(/[^a-z0-9]+/gi, '-')
const INITIAL_CHECKED = ['test-suite/auth/login.spec.ts', 'test-suite/auth/signup.spec.ts']

function TreeCheckbox({ id, state, label, onChange }) {
  const ref = useRef(null)
  // `indeterminate` is a DOM property only — there's no HTML attribute for it.
  useEffect(() => { ref.current.indeterminate = state === 'mixed' }, [state])
  return (
    <label className="tree-label" htmlFor={id}>
      <input ref={ref} id={id} type="checkbox" checked={state === 'checked'}
        aria-checked={state === 'mixed' ? 'mixed' : state === 'checked'} data-state={state}
        onChange={onChange} />
      {label}
    </label>
  )
}

function TreeNode({ node, checked, expanded, onToggleCheck, onToggleOpen }) {
  const leaves = leavesOf(node)
  const count = leaves.filter(l => checked.has(l)).length
  const state = count === 0 ? 'unchecked' : count === leaves.length ? 'checked' : 'mixed'

  if (!node.children) {
    return (
      <li role="treeitem" data-path={node.path} aria-selected={state === 'checked'}>
        <span className="tree-twisty" aria-hidden />
        <TreeCheckbox id={pathId(node.path)} state={state} label={<bdi>{node.name}</bdi>}
          onChange={() => onToggleCheck(leaves, state !== 'checked')} />
      </li>
    )
  }
  const open = expanded.has(node.path)
  return (
    <li role="treeitem" data-path={node.path} aria-expanded={open}>
      <button className="tree-twisty" data-testid={`${pathId(node.path)}-toggle`}
        aria-label={node.name} onClick={() => onToggleOpen(node.path)}>{open ? '▾' : '▸'}</button>
      <TreeCheckbox id={pathId(node.path)} state={state} label={<strong><bdi>{node.name}/</bdi></strong>}
        onChange={() => onToggleCheck(leaves, state !== 'checked')} />
      {open && (
        <ul role="group">
          {node.children.map(c => (
            <TreeNode key={c.path} node={c} checked={checked} expanded={expanded}
              onToggleCheck={onToggleCheck} onToggleOpen={onToggleOpen} />
          ))}
        </ul>
      )}
    </li>
  )
}

function TreeViewSection() {
  const { t } = useLang()
  const [checked, setChecked]   = useState(() => new Set(INITIAL_CHECKED))
  const [expanded, setExpanded] = useState(() => new Set(ALL_FOLDERS))

  const onToggleCheck = (leaves, on) => setChecked(s => {
    const next = new Set(s)
    leaves.forEach(l => (on ? next.add(l) : next.delete(l)))
    return next
  })
  const onToggleOpen = path => setExpanded(s => {
    const next = new Set(s)
    next.has(path) ? next.delete(path) : next.add(path)
    return next
  })

  return (
    <section id="sec-data-tree" className="card" data-checked-count={checked.size}>
      <SectionHeader num="D2" title={t('secD2Title')} locator="role=treeitem / data-path" />
      <p className="desc">{t('secD2Desc')}</p>
      <ul className="tree" role="tree" aria-label={t('secD2Title')}>
        <TreeNode node={TREE} checked={checked} expanded={expanded}
          onToggleCheck={onToggleCheck} onToggleOpen={onToggleOpen} />
      </ul>
      <div className="button-row">
        <button id="tree-expand-all" className="btn-secondary" onClick={() => setExpanded(new Set(ALL_FOLDERS))}>
          {t('dataExpandAll')}
        </button>
        <button id="tree-collapse-all" className="btn-secondary" onClick={() => setExpanded(new Set())}>
          {t('dataCollapseAll')}
        </button>
      </div>
      <Output id="tree-status">{t('dataTreeSelected', { n: checked.size, total: ALL_LEAVES.length })}</Output>
    </section>
  )
}

// ─── D3. Chart with hover tooltips ───────────────────────────────────────────
const SIGNUPS = [
  ['Jan', 420], ['Feb', 380], ['Mar', 510], ['Apr', 640], ['May', 590],
  ['Jun', 720], ['Jul', 810], ['Aug', 760], ['Sep', 880], ['Oct', 950],
]
const CHART = { w: 400, h: 220, left: 40, right: 10, top: 12, bottom: 26, max: 1000, step: 250 }

function ChartSection() {
  const { t, tArr } = useLang()
  const months = tArr('dataMonths')
  const [hover, setHover] = useState(null)  // index into SIGNUPS
  const [last, setLast]   = useState(null)
  const { w, h, left, right, top, bottom, max, step } = CHART
  const y = v => top + (h - top - bottom) * (1 - v / max)
  const band = (w - left - right) / SIGNUPS.length
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)

  const show = i => { setHover(i); setLast(i) }
  const tip = hover == null ? null : {
    x: ((left + hover * band + band / 2) / w) * 100,
    y: (y(SIGNUPS[hover][1]) / h) * 100,
  }

  return (
    <section id="sec-data-chart" className="card">
      <SectionHeader num="D3" title={t('secD3Title')} locator="data-month / data-value" />
      <p className="desc">{t('secD3Desc')}</p>
      <div className="data-chart" data-testid="bar-chart" dir="ltr">
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={t('dataChartLabel')}>
          {ticks.map(v => (
            <g key={v}>
              <line className="data-chart-grid" x1={left} x2={w - right} y1={y(v)} y2={y(v)} />
              <text className="data-chart-axis" x={left - 6} y={y(v) + 3} textAnchor="end">{v}</text>
            </g>
          ))}
          {SIGNUPS.map(([m, v], i) => {
            const x = left + i * band + band * 0.18
            const bw = band * 0.64
            return (
              <g key={m}>
                <rect className={`data-chart-bar ${hover === i ? 'is-hover' : ''}`} tabIndex={0}
                  data-month={m} data-value={v} x={x} y={y(v)} width={bw} height={y(0) - y(v)} rx="2"
                  aria-label={t('dataChartTip', { month: months[i] || m, value: v })}
                  onMouseEnter={() => show(i)} onMouseLeave={() => setHover(null)}
                  onFocus={() => show(i)} onBlur={() => setHover(null)} />
                <text className="data-chart-axis" x={x + bw / 2} y={h - 9} textAnchor="middle">{months[i] || m}</text>
              </g>
            )
          })}
        </svg>
        {tip && (
          <div id="chart-tooltip" className="data-chart-tip" role="tooltip"
            style={{ left: `${tip.x}%`, top: `${tip.y}%` }}>
            {t('dataChartTip', { month: months[hover] || SIGNUPS[hover][0], value: SIGNUPS[hover][1] })}
          </div>
        )}
      </div>
      <Output id="chart-status">
        {last == null ? t('dataChartNone')
          : t('dataChartHovered', { month: SIGNUPS[last][0], value: SIGNUPS[last][1] })}
      </Output>
    </section>
  )
}

// ─── D4. Skeleton loader, avatar and badges ──────────────────────────────────
function SkeletonSection() {
  const { t } = useLang()
  const [state, setState] = useState('loading')
  const [run, setRun]     = useState(0)

  useEffect(() => {
    setState('loading')
    const id = setTimeout(() => setState('loaded'), numberParam('skeletonDelay', 2000))
    return () => clearTimeout(id)
  }, [run])

  const loaded = state === 'loaded'
  return (
    <section id="sec-data-skeleton" className="card">
      <SectionHeader num="D4" title={t('secD4Title')} locator="aria-busy / data-state" />
      <p className="desc">{t('secD4Desc')}</p>
      <div className="data-profile" data-testid="profile-card" data-state={state} aria-busy={!loaded}>
        {loaded ? (
          <>
            <div className="data-avatar" data-testid="profile-avatar" aria-label={t('dataOnline', { name: 'Priya Nair' })}>
              PN<span className="data-presence" data-presence="online" />
            </div>
            <div className="data-profile-body">
              <strong data-testid="profile-name">Priya Nair</strong>
              <span className="data-profile-role">{t('dataProfileRole', { n: 150 })}</span>
              <span className="data-badges">
                <span className="data-badge data-badge-ok" data-status="passing" data-count="142">{t('dataBadgePassing', { n: 142 })}</span>
                <span className="data-badge data-badge-warn" data-status="flaky" data-count="6">{t('dataBadgeFlaky', { n: 6 })}</span>
                <span className="data-badge data-badge-bad" data-status="failing" data-count="2">{t('dataBadgeFailing', { n: 2 })}</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="data-skel data-skel-circle" />
            <div className="data-profile-body">
              <div className="data-skel" style={{ width: '55%', height: 13 }} />
              <div className="data-skel" style={{ width: '80%', height: 10 }} />
              <div className="data-skel" style={{ width: '65%', height: 16 }} />
            </div>
          </>
        )}
      </div>
      <div className="button-row">
        <button id="skeleton-reload" className="btn-secondary" onClick={() => setRun(r => r + 1)}>
          {t('dataReloadCard')}
        </button>
      </div>
      <Output id="skeleton-status">{loaded ? t('dataCardLoaded') : t('dataCardLoading')}</Output>
    </section>
  )
}

// ─── D5. Infinite scroll list ────────────────────────────────────────────────
const BATCH = 20
const MAX_ROWS = 100
const TXN_TYPES = ['Invoice', 'Refund', 'Payout', 'Transfer']
const txn = i => ({ index: i, ref: `TXN-${String(i).padStart(4, '0')}`, type: TXN_TYPES[i % 4], amount: 1000 + i * 7 })

function InfiniteScrollSection() {
  const { t } = useLang()
  const boxRef = useRef(null)
  const sentinelRef = useRef(null)
  const [count, setCount] = useState(BATCH)
  const [state, setState] = useState('idle')  // idle | loading | end

  useEffect(() => {
    if (state !== 'idle') return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setState('loading')
    }, { root: boxRef.current, rootMargin: '0px 0px 20px 0px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [state, count])

  useEffect(() => {
    if (state !== 'loading') return
    const id = setTimeout(() => {
      const next = Math.min(count + BATCH, MAX_ROWS)
      setCount(next)
      setState(next >= MAX_ROWS ? 'end' : 'idle')
    }, numberParam('scrollDelay', 700))
    return () => clearTimeout(id)
  }, [state, count])

  const reset = () => { setCount(BATCH); setState('idle'); boxRef.current.scrollTop = 0 }

  return (
    <section id="sec-data-infinite" className="card">
      <SectionHeader num="D5" title={t('secD5Title')} locator="data-loaded / data-state" />
      <p className="desc">{t('secD5Desc')}</p>
      <div ref={boxRef} className="data-scrollbox" data-testid="infinite-list" data-loaded={count} data-state={state}>
        {Array.from({ length: count }, (_, i) => txn(i + 1)).map(r => (
          <div key={r.index} className="data-list-row" data-index={r.index}>
            <span className="data-list-idx">{r.ref}</span>
            <span>{r.type}</span>
            <span className="data-list-amount">{formatSalary(r.amount)}</span>
          </div>
        ))}
        <div ref={sentinelRef} className="data-list-status" id="infinite-status">
          {state === 'loading' ? t('dataLoadingMore') : state === 'end' ? t('dataEndOfList') : t('dataScrollForMore')}
        </div>
      </div>
      <div className="button-row">
        <button id="infinite-reset" className="btn-secondary" onClick={reset}>{t('dataReset')}</button>
      </div>
      <Output id="infinite-count">{t('dataLoadedCount', { n: count, total: MAX_ROWS })}</Output>
    </section>
  )
}

// ─── D6. Virtualised list ────────────────────────────────────────────────────
const V_TOTAL = 10000
const V_ROW = 32
const V_BUFFER = 4
const V_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry']

function VirtualListSection() {
  const { t } = useLang()
  const boxRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight]       = useState(240)
  const [jump, setJump]           = useState('5000')
  const [jumpError, setJumpError] = useState('')

  useLayoutEffect(() => { setHeight(boxRef.current.clientHeight) }, [])

  const firstVisible = Math.floor(scrollTop / V_ROW)
  const first = Math.max(0, firstVisible - V_BUFFER)
  const last  = Math.min(V_TOTAL - 1, Math.ceil((scrollTop + height) / V_ROW) + V_BUFFER)
  const rendered = last - first + 1

  const goTo = () => {
    const n = Number(jump)
    if (!Number.isInteger(n) || n < 1 || n > V_TOTAL) {
      setJumpError('dataJumpInvalid')
      return
    }
    setJumpError('')
    boxRef.current.scrollTop = (n - 1) * V_ROW
  }

  const rows = []
  for (let i = first; i <= last; i++) {
    rows.push(
      <div key={i} className="data-list-row data-vrow" data-index={i + 1} style={{ top: i * V_ROW }}>
        <span className="data-list-idx">{i + 1}</span>
        <span>{V_NAMES[i % V_NAMES.length]} · {t('dataAccount')} {100000 + i}</span>
      </div>
    )
  }

  return (
    <section id="sec-data-virtual" className="card">
      <SectionHeader num="D6" title={t('secD6Title')} locator="data-index / data-rendered" />
      <p className="desc">{t('secD6Desc')}</p>
      <div ref={boxRef} className="data-scrollbox" data-testid="virtual-list" data-total={V_TOTAL}
        data-rendered={rendered} data-first-visible={firstVisible + 1}
        onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
        <div style={{ position: 'relative', height: V_TOTAL * V_ROW }}>{rows}</div>
      </div>
      <div className="input-row">
        <input id="virtual-jump-input" type="text" inputMode="numeric" aria-label={t('dataJumpLabel')}
          value={jump} onChange={e => setJump(e.target.value.trim())}
          onKeyDown={e => { if (e.key === 'Enter') goTo() }} />
        <button id="virtual-jump-btn" className="btn-primary" onClick={goTo}>{t('dataJumpBtn')}</button>
      </div>
      {jumpError && <p id="virtual-jump-error" className="error-msg" role="alert">{t(jumpError, { total: V_TOTAL.toLocaleString('en-US') })}</p>}
      <Output id="virtual-status">
        {t('dataVirtualStatus', { total: V_TOTAL.toLocaleString('en-US'), rendered, first: firstVisible + 1 })}
      </Output>
    </section>
  )
}

// ─── D7. Back-to-top button ──────────────────────────────────────────────────
const SHOW_AFTER = 150

function BackToTopSection() {
  const { t } = useLang()
  const boxRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const visible = scrollTop > SHOW_AFTER

  const toTop = () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    boxRef.current.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <section id="sec-data-backtotop" className="card">
      <SectionHeader num="D7" title={t('secD7Title')} locator="id / scrollTop" />
      <p className="desc">{t('secD7Desc')}</p>
      <div ref={boxRef} id="backtotop-box" className="data-scrollbox data-prose"
        data-scroll-top={Math.round(scrollTop)} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i} data-paragraph={i + 1}>{t('dataChangelogLine', { n: i + 1 })}</p>
        ))}
        {visible && (
          <button id="back-to-top" className="btn-primary data-to-top" onClick={toTop}>
            ↑ {t('dataBackToTop')}
          </button>
        )}
      </div>
      <Output id="backtotop-status">
        {t('dataScrollStatus', { top: Math.round(scrollTop), state: t(visible ? 'dataShown' : 'dataHidden') })}
      </Output>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DataPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero data-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="data-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('dataHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('dataHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>🗂️</div>
      </header>

      <h2 className="media-group-title">{t('dataGroupTables')}</h2>
      <div className="content-grid media-grid">
        <SortableTableSection />
        <TreeViewSection />
        <ChartSection />
        <SkeletonSection />
      </div>

      <h2 className="media-group-title">{t('dataGroupLists')}</h2>
      <div className="content-grid media-grid">
        <InfiniteScrollSection />
        <VirtualListSection />
        <BackToTopSection />
      </div>
    </div>
  )
}
