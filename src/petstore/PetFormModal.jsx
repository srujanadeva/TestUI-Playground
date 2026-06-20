import { useEffect, useState } from 'react'
import { useLang } from '../i18n.jsx'

const STATUSES = ['available', 'pending', 'sold']

function parseTags(text) {
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: i + 1, name }))
}

function tagsToText(tags) {
  return (tags || []).map(t => t.name).join(', ')
}

function urlsToText(urls) {
  return (urls || []).join('\n')
}

function parseUrls(text) {
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
}

export default function PetFormModal({ open, pet, onClose, onSave }) {
  const { t, lang } = useLang()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('available')
  const [category, setCategory] = useState('')
  const [photoText, setPhotoText] = useState('')
  const [tagText, setTagText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  const livePreviewTags = parseTags(tagText)
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
        category: category.trim() ? { id: 1, name: category.trim() } : undefined,
        photoUrls: parseUrls(photoText),
        tags: livePreviewTags,
      })
    } catch (err) {
      setError(err.message || 'Save failed')
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
