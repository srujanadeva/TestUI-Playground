import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { listPets, createPet, updatePet, deletePet } from './api.js'
import PetCard from './PetCard.jsx'
import PetFormModal from './PetFormModal.jsx'

const FILTERS = ['all', 'available', 'pending', 'sold']

export default function PetstorePage() {
  const { t, lang } = useLang()
  const { token, user } = useAuth()

  const [pets, setPets] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [toast, setToast] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listPets({ token })
      setPets(data.pets)
    } catch (err) {
      setError(err.message || 'Failed to load pets')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const filteredPets = useMemo(
    () => (filter === 'all' ? pets : pets.filter(p => p.status === filter)),
    [pets, filter],
  )

  const stats = useMemo(() => {
    const base = { all: pets.length, available: 0, pending: 0, sold: 0 }
    pets.forEach(p => {
      if (base[p.status] != null) base[p.status]++
    })
    return base
  }, [pets])

  function openAdd() {
    setEditingPet(null)
    setModalOpen(true)
  }

  function openEdit(pet) {
    setEditingPet(pet)
    setModalOpen(true)
  }

  async function handleSave(body) {
    if (editingPet) {
      const data = await updatePet(editingPet.id, body, token)
      setPets(list => list.map(p => (p.id === data.pet.id ? data.pet : p)))
      showToast(t('toastPetUpdated'))
    } else {
      const data = await createPet(body, token)
      setPets(list => [data.pet, ...list])
      showToast(t('toastPetAdded'))
    }
    setModalOpen(false)
    setEditingPet(null)
  }

  async function handleDelete(pet) {
    const confirmed = window.confirm(t('petConfirmDelete', { name: pet.name }))
    if (!confirmed) return
    try {
      await deletePet(pet.id, token)
      setPets(list => list.filter(p => p.id !== pet.id))
      showToast(t('toastPetDeleted'))
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

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
        <StatTile label={t('petstoreStatTotal')} value={stats.all} variant="total" testid="stat-total" />
        <StatTile label={t('petstoreStatAvailable')} value={stats.available} variant="available" testid="stat-available" />
        <StatTile label={t('petstoreStatPending')} value={stats.pending} variant="pending" testid="stat-pending" />
        <StatTile label={t('petstoreStatSold')} value={stats.sold} variant="sold" testid="stat-sold" />
      </section>

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
              onClick={() => setFilter(key)}
              data-testid={`pets-filter-${key}`}
            >
              <span className="pet-chip-dot" /> {t(labelKey)}
            </button>
          )
        })}
      </section>

      {error && (
        <div className="pet-page-error" role="alert" data-testid="petstore-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="pet-loading" role="status">
          <div className="spinner" />
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="pet-empty-state" data-testid="pets-empty">
          <div className="pet-empty-illustration" aria-hidden>🐾</div>
          <p>{t('petEmptyState')}</p>
          <button className="pet-btn pet-btn-primary" onClick={openAdd} data-testid="pets-empty-add">
            {t('petAdd')}
          </button>
        </div>
      ) : (
        <div className="pets-grid" data-testid="pets-grid">
          {filteredPets.map(pet => (
            <PetCard key={pet.id} pet={pet} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
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

      {toast && (
        <div className="pet-toast" role="status" data-testid="pet-toast">
          {toast}
        </div>
      )}
    </div>
  )
}

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
