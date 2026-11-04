// In-page "Delete this pet?" dialog, used instead of window.confirm() when the
// petstore is opened with ?confirm=dialog. Esc or the backdrop cancels.
import { useEffect, useRef } from 'react'
import { useLang } from '../i18n.jsx'

/**
 * Modal asking to confirm a delete. Focus starts on Cancel, so pressing Enter by
 * accident doesn't delete anything.
 * @param pet The pet to delete, or null when the dialog is closed.
 */
export default function ConfirmDeleteDialog({ pet, onConfirm, onCancel }) {
  const { t, lang } = useLang()
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!pet) return
    cancelRef.current?.focus()
    const onKey = e => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pet, onCancel])

  if (!pet) return null

  return (
    <div className="pet-modal-backdrop" onClick={onCancel} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div
        className="pet-modal pet-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pet-confirm-title"
        onClick={e => e.stopPropagation()}
        data-testid="pet-confirm-dialog"
      >
        <header className="pet-modal-header">
          <h2 id="pet-confirm-title">{t('petDelete')}</h2>
        </header>
        <p className="pet-confirm-text" data-testid="pet-confirm-text">
          {t('petConfirmDelete', { name: pet.name })}
        </p>
        <footer className="pet-modal-footer">
          <button
            ref={cancelRef}
            type="button"
            className="pet-btn pet-btn-ghost"
            onClick={onCancel}
            data-testid="pet-confirm-cancel"
          >
            {t('petCancel')}
          </button>
          <button
            type="button"
            className="pet-btn pet-btn-danger"
            onClick={() => onConfirm(pet)}
            data-testid="pet-confirm-ok"
          >
            {t('petConfirmDeleteOk')}
          </button>
        </footer>
      </div>
    </div>
  )
}
