// Add / edit pet dialog for the petstore. The form edits tags and photo URLs as
// plain text and converts them to the API's shape when saving. An edit sends the
// pet's updatedAt, so saving over a change made in another tab fails with a 409.
import { useEffect, useState } from 'react'
import { useLang } from '../i18n.jsx'

const STATUSES = ['available', 'pending', 'sold']

// Same limits the API enforces (server/routes/pets.js). The photo and tag boxes hold
// lists, so they only get a loose cap (count × (item length + separator)); the
// per-item and count checks are the server's, and its message shows in the form.
const MAX = { name: 50, category: 30, photoText: 5 * 501, tagText: 10 * 22 }

/**
 * "cute, fluffy" → [{ id: 1, name: 'cute' }, { id: 2, name: 'fluffy' }]; blanks are dropped.
 * A tag the pet already has keeps its id, and new tags get ids after the highest
 * existing one, so ids stay stable across saves.
 * @param existing The pet's current tags, or [] for a new pet.
 */
function parseTags(text, existing = []) {
  const idByName = new Map(existing.map(t => [t.name, t.id]))
  let nextId = Math.max(0, ...existing.map(t => t.id).filter(Number.isFinite)) + 1
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => ({ id: idByName.get(name) ?? nextId++, name }))
}

/** The reverse of parseTags: tag objects → "cute, fluffy". */
function tagsToText(tags) {
  return (tags || []).map(t => t.name).join(', ')
}

/** Photo URLs → one per line, for the textarea. */
function urlsToText(urls) {
  return (urls || []).join('\n')
}

/** The reverse of urlsToText: one URL per line, blank lines dropped. */
function parseUrls(text) {
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Modal form for adding a pet, or editing one when `pet` is given.
 * Clicking the backdrop closes it. Save is disabled until the pet has a name.
 * @param pet The pet to edit, or null to add a new one.
 * @param onSave Called with the API body; if it throws, the error is shown in the form
 *   and the modal stays open. The caller closes the modal on success.
 */
export default function PetFormModal({ open, pet, onClose, onSave }) {
  const { t, lang } = useLang()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('available')
  const [category, setCategory] = useState('')
  const [photoText, setPhotoText] = useState('')
  const [tagText, setTagText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reload the fields from `pet` each time the modal opens, so it never shows a previous pet's values.
  useEffect(() => {
    if (!open) return
    setName(pet?.name || '')
    setStatus(pet?.status || 'available')
    setCategory(pet?.category?.name || '')
    setPhotoText(urlsToText(pet?.photoUrls))
    setTagText(tagsToText(pet?.tags))
    setError('')
    setSubmitting(false)
  }, [open, pet])

  if (!open) return null

  const livePreviewTags = parseTags(tagText, pet?.tags)
  const canSave = name.trim().length > 0 && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return
    setSubmitting(true)
    setError('')
    try {
      await onSave({
        name: name.trim(),
        status,
        category: category.trim() ? { id: pet?.category?.id ?? 1, name: category.trim() } : undefined,
        photoUrls: parseUrls(photoText),
        tags: livePreviewTags,
        ...(pet && { updatedAt: pet.updatedAt }),
      })
    } catch (err) {
      setError(err.status === 409 ? t('petConflict') : err.message || 'Save failed')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="pet-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="pet-modal"
        onClick={e => e.stopPropagation()}
        data-testid="pet-form-modal"
      >
        <header className="pet-modal-header">
          <h2>{pet ? t('petEdit') : t('petAdd')}</h2>
          <button
            type="button"
            className="pet-modal-close"
            onClick={onClose}
            aria-label={t('petCancel')}
            data-testid="pet-form-close"
          >
            ✕
          </button>
        </header>
        <form className="pet-form" onSubmit={handleSubmit}>
          <label className="pet-field">
            <span>{t('petName')}</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={MAX.name}
              required
              data-testid="pet-form-name"
            />
          </label>
          <label className="pet-field">
            <span>{t('petStatus')}</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              data-testid="pet-form-status"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {t(
                    s === 'available'
                      ? 'petStatusAvailable'
                      : s === 'pending'
                        ? 'petStatusPending'
                        : 'petStatusSold',
                  )}
                </option>
              ))}
            </select>
          </label>
          <label className="pet-field">
            <span>{t('petCategory')}</span>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              maxLength={MAX.category}
              placeholder="dog, cat, rabbit…"
              data-testid="pet-form-category"
            />
          </label>
          <label className="pet-field">
            <span>{t('petPhotoUrls')}</span>
            <textarea
              rows={3}
              value={photoText}
              onChange={e => setPhotoText(e.target.value)}
              maxLength={MAX.photoText}
              placeholder="https://…"
              data-testid="pet-form-photos"
            />
          </label>
          <label className="pet-field">
            <span>{t('petTags')}</span>
            <input
              type="text"
              value={tagText}
              onChange={e => setTagText(e.target.value)}
              maxLength={MAX.tagText}
              placeholder="cute, fluffy, energetic"
              data-testid="pet-form-tags"
            />
            {livePreviewTags.length > 0 && (
              <div className="pet-tag-preview">
                {livePreviewTags.map(tag => (
                  <span key={`${tag.id}-${tag.name}`} className="pet-tag-chip">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </label>
          {error && (
            <div className="pet-form-error" role="alert" data-testid="pet-form-error">
              {error}
            </div>
          )}
          <footer className="pet-modal-footer">
            <button
              type="button"
              className="pet-btn pet-btn-ghost"
              onClick={onClose}
              data-testid="pet-form-cancel"
            >
              {t('petCancel')}
            </button>
            <button
              type="submit"
              className="pet-btn pet-btn-primary"
              disabled={!canSave}
              data-testid="pet-form-save"
            >
              {submitting ? '…' : t('petSave')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
