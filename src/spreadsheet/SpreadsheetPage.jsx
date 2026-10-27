import { useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { apiFetch } from '../api/client.js'
import { SectionHeader } from '../ui.jsx'

// Quick checks before uploading; the server repeats them and has the final say.
const ACCEPT = ['.xlsx', '.xls', '.csv']
const MAX_FILE_BYTES = 2 * 1024 * 1024
const PER_PAGE = 10
// Page-number buttons shown at once; the rest are reached with ‹ › « ».
const PAGE_WINDOW = 7

function pageNumbers(page, totalPages) {
  const start = Math.max(1, Math.min(page - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW + 1))
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

// ─── S1. Excel Upload Table ──────────────────────────────────────────────────
function SheetUploadSection() {
  const { t } = useLang()
  const { token } = useAuth()
  const inputRef = useRef(null)
  const [status, setStatus]   = useState('empty') // empty | uploading | loaded | error
  const [workbook, setWorkbook] = useState(null)  // { fileName, sheets: [{ name, headers, rows }] }
  const [sheetIndex, setSheetIndex] = useState(0)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [error, setError]     = useState('')

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPT.includes(ext)) { setError(t('sheetErrType')); setStatus('error'); return }
    if (file.size > MAX_FILE_BYTES) { setError(t('sheetErrSize')); setStatus('error'); return }

    setStatus('uploading')
    setError('')
    const body = new FormData()
    body.append('file', file)
    try {
      const data = await apiFetch('/api/spreadsheets/parse', { method: 'POST', body, token })
      setWorkbook(data)
      setSheetIndex(0)
      setSearch('')
      setPage(1)
      setStatus('loaded')
    } catch (err) {
      // A failed upload leaves the table that is already on screen as it was.
      setError(err.status ? err.message : t('sheetErrNetwork'))
      setStatus('error')
    }
  }

  function clear() {
    setWorkbook(null)
    setSheetIndex(0)
    setSearch('')
    setPage(1)
    setError('')
    setStatus('empty')
  }

  const sheet = workbook?.sheets[sheetIndex]
  const query = search.trim().toLowerCase()
  // Each row keeps its 1-based position in the sheet, so data-row-index is stable while filtering.
  const allRows = sheet ? sheet.rows.map((cells, i) => ({ index: i + 1, cells })) : []
  const filtered = query ? allRows.filter(r => r.cells.some(c => c.toLowerCase().includes(query))) : allRows
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const hasData = Boolean(sheet)

  let emptyText = ''
  if (!hasData) emptyText = t('sheetEmpty')
  else if (sheet.rows.length === 0) emptyText = t('sheetNoRows')
  else if (filtered.length === 0) emptyText = t('noResults')

  return (
    <section id="sec-sheet-upload" className="card media-wide"
      data-state={status} data-sheet={sheet?.name ?? ''} data-row-count={sheet?.rows.length ?? 0}>
      <SectionHeader num="S1" title={t('secS1Title')} locator="id / data-row-index / data-col" />
      <p className="desc">{t('secS1Desc')}</p>

      <div className="sheet-toolbar">
        <button id="sheet-upload-btn" onClick={() => inputRef.current.click()} disabled={status === 'uploading'}>
          {status === 'uploading' ? t('sheetUploading') : t('btnUploadSheet')}
        </button>
        <input ref={inputRef} id="sheet-file-input" type="file" accept={ACCEPT.join(',')}
          style={{ display: 'none' }}
          onChange={e => { handleFile(e.target.files[0]); e.target.value = '' }} />
        {workbook?.sheets.length > 1 && (
          <select id="sheet-select" aria-label={t('sheetSelectLabel')} value={sheetIndex}
            onChange={e => { setSheetIndex(Number(e.target.value)); setSearch(''); setPage(1) }}>
            {workbook.sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
          </select>
        )}
        <input id="sheet-search" type="text" className="sheet-search" placeholder={t('phSheetSearch')}
          value={search} disabled={!hasData}
          onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <button id="sheet-clear-btn" className="btn-secondary" onClick={clear}
          disabled={!workbook && status !== 'error'}>
          {t('btnClearSheet')}
        </button>
      </div>
      <p className="drop-hint">{t('sheetHint')}</p>

      {workbook && (
        <p id="sheet-file-info" className="sheet-file-info">
          <bdi>{workbook.fileName}</bdi> · {t('sheetFileInfo', { sheets: workbook.sheets.length, rows: sheet.rows.length })}
        </p>
      )}
      {error && <p id="sheet-error" className="error-msg" role="alert">{error}</p>}

      <div className="table-wrap">
        <table id="sheet-table">
          {hasData && (
            <thead>
              <tr>
                {sheet.headers.map((h, i) => <th key={i} data-col-index={i}>{h}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map(r => (
              <tr key={r.index} data-row-index={r.index}>
                {r.cells.map((c, i) => <td key={i} data-col={sheet.headers[i]} data-col-index={i}>{c}</td>)}
              </tr>
            ))}
            {emptyText && (
              <tr>
                <td id="sheet-no-results" className="no-results" colSpan={hasData ? sheet.headers.length : 1}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasData && (
        <>
          <div className="pagination">
            <button id="sheet-page-first" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button id="sheet-page-prev"  onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {pageNumbers(page, totalPages).map(n => (
              <button key={n} data-page={n} onClick={() => setPage(n)}
                className={`page-num ${page === n ? 'page-active' : ''}`}>{n}</button>
            ))}
            <button id="sheet-page-next" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>›</button>
            <button id="sheet-page-last" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
          </div>
          <p id="sheet-page-info" className="page-info">
            {t('sheetPageInfo', { shown: rows.length, total: filtered.length, page, totalPages })}
          </p>
        </>
      )}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SpreadsheetPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  return (
    <div className="media-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero spreadsheet-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="spreadsheet-welcome">
            {t('mediaHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('spreadsheetHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('spreadsheetHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>📊</div>
      </header>

      <div className="content-grid media-grid">
        <SheetUploadSection />
      </div>
    </div>
  )
}
