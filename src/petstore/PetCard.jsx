import { useLang } from '../i18n.jsx'
import { petEmoji } from './petAvatars.js'

export default function PetCard({ pet, onEdit, onDelete }) {
  const { t } = useLang()
  const statusKey =
    pet.status === 'pending'
      ? 'petStatusPending'
      : pet.status === 'sold'
        ? 'petStatusSold'
        : 'petStatusAvailable'

  return (
    <article className={`pet-card status-${pet.status}`} data-testid={`pet-card-${pet.id}`}>
      <div className="pet-card-avatar" aria-hidden>
        <span>{petEmoji(pet)}</span>
      </div>
      <div className="pet-card-body">
        <h3 className="pet-card-name" data-testid={`pet-name-${pet.id}`}>
          {pet.name}
        </h3>
        {pet.category?.name && (
          <p className="pet-card-category">{pet.category.name}</p>
        )}
        <span
          className={`pet-status-pill status-${pet.status}`}
          data-testid={`pet-status-${pet.id}`}
        >
          <span className="pet-status-dot" /> {t(statusKey)}
        </span>
        {pet.tags?.length > 0 && (
          <div className="pet-card-tags">
            {pet.tags.map(tag => (
              <span key={`${pet.id}-${tag.id}-${tag.name}`} className="pet-tag-chip">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="pet-card-actions">
        <button
          className="pet-icon-btn"
          onClick={() => onEdit(pet)}
          aria-label={t('petEdit')}
          data-testid={`pet-edit-${pet.id}`}
        >
          ✏️
        </button>
        <button
          className="pet-icon-btn pet-icon-danger"
          onClick={() => onDelete(pet)}
          aria-label={t('petDelete')}
          data-testid={`pet-delete-${pet.id}`}
        >
          🗑️
        </button>
      </div>
    </article>
  )
}
