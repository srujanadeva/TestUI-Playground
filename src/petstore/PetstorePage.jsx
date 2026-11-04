// Petstore page (/petstore): the signed-in user's pets with status stats, filter
// chips, search, paging, and add / edit / delete. URL params: `?toastDuration=<ms>`
// (default 2500), `?pageSize=` (12), `?searchDelay=<ms>` (300), and `?confirm=dialog`
// to confirm deletes in an in-page dialog instead of the browser's confirm().
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { numberParam } from '../ui.jsx'
import { listPets, createPet, updatePet, deletePet } from './api.js'
import PetCard from './PetCard.jsx'
import PetFormModal from './PetFormModal.jsx'
import ConfirmDeleteDialog from './ConfirmDeleteDialog.jsx'

const FILTERS = ['all', 'available', 'pending', 'sold']

const EMPTY = { pets: [], page: 1, pages: 1, total: 0, counts: { all: 0, available: 0, pending: 0, sold: 0 } }

/**
 * The server filters, searches and pages; the stat tiles use its `counts`, which
 * always cover every pet whichever filter or search is active. After any save or
 * delete the current page is fetched again, since the change can move pets
 * between pages.
 */
export default function PetstorePage() {
  const { t, lang } = useLang()
  const { token, user } = useAuth()

  const [settings] = useState(() => ({
    pageSize: numberParam('pageSize', 12, 1, 100),
    searchDelay: numberParam('searchDelay', 300, 0, 5000),
    inPageConfirm: new URLSearchParams(window.location.search).get('confirm') === 'dialog',
  }))

  const [data, setData] = useState(EMPTY)
  const [filter, setFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [deletingPet, setDeletingPet] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const requestId = useRef(0)

  const refresh = useCallback(async () => {
    // Typing in the search box starts a request per pause; only the newest may update the page.
    const id = ++requestId.current
    setBusy(true)
    setError('')
    try {
      const res = await listPets({ token, status: filter, q: search, page, limit: settings.pageSize })
      if (id === requestId.current) setData(res)
    } catch (err) {
      if (id === requestId.current) setError(err.message || 'Failed to load pets')
    } finally {
      if (id === requestId.current) {
        setBusy(false)
        setLoading(false)
      }
    }
  }, [token, filter, search, page, settings.pageSize])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchText.trim())
      setPage(1)
    }, settings.searchDelay)
    return () => clearTimeout(id)
  }, [searchText, settings.searchDelay])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  /**
   * Shows a confirmation message for `?toastDuration=` ms (default 2.5 s). A new
   * toast restarts the timer, so the previous one's timeout can't hide it early.
   */
  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), numberParam('toastDuration', 2500, 0, 60000))
  }

  function chooseFilter(key) {
    setFilter(key)
    setPage(1)
  }

  function openAdd() {
    setEditingPet(null)
    setModalOpen(true)
  }

  function openEdit(pet) {
    setEditingPet(pet)
    setModalOpen(true)
  }

  /**
   * Creates or updates the pet from the modal, depending on whether one is being edited.
   * Errors are left to propagate so PetFormModal can show them and stay open; a 409
   * (changed in another tab) also reloads the list, so reopening the pet shows the latest.
   */
  async function handleSave(body) {
    try {
      if (editingPet) {
        await updatePet(editingPet.id, body, token)
        showToast(t('toastPetUpdated'))
      } else {
        await createPet(body, token)
        showToast(t('toastPetAdded'))
      }
    } catch (err) {
      if (err.status === 409) refresh()
      throw err
    }
    setModalOpen(false)
    setEditingPet(null)
    // A new pet is the newest, so it is on page 1; changing the page triggers the reload.
    if (!editingPet && page !== 1) setPage(1)
    else refresh()
  }

  /** Asks for confirmation, in the browser's confirm() or the in-page dialog, then deletes. */
  function handleDelete(pet) {
    if (settings.inPageConfirm) setDeletingPet(pet)
    else if (window.confirm(t('petConfirmDelete', { name: pet.name }))) removePet(pet)
  }

  const cancelDelete = useCallback(() => setDeletingPet(null), [])

  /** Deletes the pet and reloads the page; the server moves back a page if this one is now empty. */
  async function removePet(pet) {
    setDeletingPet(null)
    try {
      await deletePet(pet.id, token)
      showToast(t('toastPetDeleted'))
      refresh()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const { pets, counts } = data

  return (
    <div className="petstore-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="pet-hero">
        <div className="pet-hero-content">
          <div className="pet-hero-welcome" data-testid="petstore-welcome">
            {t('petstoreHeroWelcome', { name: user?.name || '' })}
          </div>
          <h1 className="pet-hero-title">{t('petstoreHeroTitle')}</h1>
          <p className="pet-hero-subtitle">{t('petstoreHeroSubtitle')}</p>
        </div>
        <div className="pet-hero-paws" aria-hidden>
          🐾
        </div>
      </header>

      <section className="pet-stats" aria-label="Pet statistics">
        <StatTile label={t('petstoreStatTotal')} value={counts.all} variant="total" testid="stat-total" />
        <StatTile label={t('petstoreStatAvailable')} value={counts.available} variant="available" testid="stat-available" />
        <StatTile label={t('petstoreStatPending')} value={counts.pending} variant="pending" testid="stat-pending" />
        <StatTile label={t('petstoreStatSold')} value={counts.sold} variant="sold" testid="stat-sold" />
      </section>

      <div className="pet-toolbar">
        <section className="pet-filter-chips" role="tablist" aria-label="Filter by status">
          {FILTERS.map(key => {
            const labelKey =
              key === 'all'
                ? 'petstoreFilterAll'
                : key === 'available'
                  ? 'petStatusAvailable'
                  : key === 'pending'
                    ? 'petStatusPending'
                    : 'petStatusSold'
            const active = filter === key
            return (
              <button
                key={key}
                role="tab"
                aria-pressed={active}
                className={`pet-chip status-${key} ${active ? 'is-active' : ''}`}
                onClick={() => chooseFilter(key)}
                data-testid={`pets-filter-${key}`}
              >
                <span className="pet-chip-dot" /> {t(labelKey)}
              </button>
            )
          })}
        </section>
        <input
          type="search"
          className="pet-search"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder={t('petSearchPlaceholder')}
          aria-label={t('petSearchLabel')}
          maxLength={50}
          data-testid="pets-search"
        />
      </div>

      {error && (
        <div className="pet-page-error" role="alert" data-testid="petstore-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="pet-loading" role="status">
          <div className="spinner" />
        </div>
      ) : pets.length === 0 ? (
        counts.all === 0 ? (
          <div className="pet-empty-state" data-testid="pets-empty">
            <div className="pet-empty-illustration" aria-hidden>🐾</div>
            <p>{t('petEmptyState')}</p>
            <button className="pet-btn pet-btn-primary" onClick={openAdd} data-testid="pets-empty-add">
              {t('petAdd')}
            </button>
          </div>
        ) : (
          <div className="pet-empty-state" data-testid="pets-no-matches">
            <p>{t('petNoMatches')}</p>
          </div>
        )
      ) : (
        <>
          <div className="pets-grid" aria-busy={busy} data-testid="pets-grid">
            {pets.map(pet => (
              <PetCard key={pet.id} pet={pet} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
          {data.pages > 1 && (
            <nav className="pet-pager" aria-label={t('petPageInfo', { page: data.page, pages: data.pages })}>
              <button
                className="pet-btn pet-btn-ghost"
                onClick={() => setPage(data.page - 1)}
                disabled={data.page <= 1}
                data-testid="pets-page-prev"
              >
                {t('petPagePrev')}
              </button>
              <span data-testid="pets-page-info">{t('petPageInfo', { page: data.page, pages: data.pages })}</span>
              <button
                className="pet-btn pet-btn-ghost"
                onClick={() => setPage(data.page + 1)}
                disabled={data.page >= data.pages}
                data-testid="pets-page-next"
              >
                {t('petPageNext')}
              </button>
            </nav>
          )}
        </>
      )}

      <button
        className="pet-fab"
        onClick={openAdd}
        aria-label={t('petAdd')}
        data-testid="pets-add-button"
      >
        <span className="pet-fab-plus">＋</span>
        <span className="pet-fab-label">{t('petAdd')}</span>
      </button>

      <PetFormModal
        open={modalOpen}
        pet={editingPet}
        onClose={() => {
          setModalOpen(false)
          setEditingPet(null)
        }}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog pet={deletingPet} onConfirm={removePet} onCancel={cancelDelete} />

      {toast && (
        <div className="pet-toast" role="status" data-testid="pet-toast">
          {toast}
        </div>
      )}
    </div>
  )
}

/**
 * One count in the stats row.
 * @param variant "total" or a pet status; picks the tile's colour.
 */
function StatTile({ label, value, variant, testid }) {
  return (
    <div className={`pet-stat-tile status-${variant}`} data-testid={testid}>
      <div className="pet-stat-value">{value}</div>
      <div className="pet-stat-label">
        <span className="pet-status-dot" /> {label}
      </div>
    </div>
  )
}
