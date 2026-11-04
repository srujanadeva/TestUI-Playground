// Playground sections 07, 08, 09 and 25 (sidebar group "Selection"): checkboxes,
// radio cards, dropdown and tag multi-select, and star ratings.
import { useState } from 'react'
import { useLang } from '../i18n.jsx'
import { SectionHeader, Output } from '../ui.jsx'

// ─── 07. Checkboxes ──────────────────────────────────────────────────────────
// Stable ids for the checkboxes; the visible labels come from tArr('skills') in the same order.
const SKILL_KEYS = ['javascript', 'python', 'java', 'rust', 'go', 'typescript']

/**
 * Skill checkboxes wrapped in <label for>. The selection is stored by index, so it
 * survives a language switch even though the labels change.
 */
export function CheckboxSection() {
  const { t, tArr } = useLang()
  const skills = tArr('skills')
  const [selected, setSelected] = useState([])
  const toggle = i => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])
  return (
    <section id="sec-checkbox" className="card">
      <SectionHeader num="07" title={t('sec07Title')} locator="label[for]" tip="tip07" />
      <p className="desc">{t('sec07Desc')}</p>
      <div className="checkbox-grid">
        {SKILL_KEYS.map((key, i) => (
          <label key={key} className="checkbox-label" htmlFor={`cb-${key}`}>
            <input type="checkbox" id={`cb-${key}`}
              checked={selected.includes(i)} onChange={() => toggle(i)} />
            {skills[i]}
          </label>
        ))}
      </div>
      <Output id="checkbox-summary">
        {selected.length === 0
          ? t('nothingSelected')
          : t('selectedSkills', { skills: selected.map(i => skills[i]).join(', ') })}
      </Output>
    </section>
  )
}

// ─── 08. Radio Group ─────────────────────────────────────────────────────────
const PLANS = [
  { id: 'plan-free',       value: 'Free',       price: '$0/mo',  descKey: 'planFreeDesc' },
  { id: 'plan-pro',        value: 'Pro',        price: '$12/mo', descKey: 'planProDesc' },
  { id: 'plan-enterprise', value: 'Enterprise', price: '$49/mo', descKey: 'planEnterpriseDesc' },
]

/** Plan cards built from radio inputs sharing name="plan-type". */
export function RadioSection() {
  const { t } = useLang()
  const [plan, setPlan] = useState('')
  return (
    <section id="sec-radio" className="card">
      <SectionHeader num="08" title={t('sec08Title')} locator="name" tip="tip08" />
      <p className="desc">{t('sec08Desc')}</p>
      <div className="radio-cards">
        {PLANS.map(p => (
          <label key={p.id} htmlFor={p.id}
            className={`radio-card ${plan === p.value ? 'radio-selected' : ''}`}>
            <input type="radio" id={p.id} name="plan-type" value={p.value}
              checked={plan === p.value} onChange={() => setPlan(p.value)} />
            <div className="radio-card-body">
              <strong>{p.value}</strong>
              <span className="radio-price">{p.price}</span>
              <small>{t(p.descKey)}</small>
            </div>
          </label>
        ))}
      </div>
      {plan && <Output id="selected-plan">{t('selectedPlan', { plan })}</Output>}
    </section>
  )
}

// ─── 09. Dropdown & Multi-Select ─────────────────────────────────────────────
/** A native <select> of countries, and toggle buttons that act as a multi-select of tags. */
export function DropdownSection() {
  const { t, tArr } = useLang()
  const countries = tArr('countries')
  const tagList   = tArr('tagList')
  const [country, setCountry] = useState('')
  const [tags, setTags]       = useState([])
  const toggleTag = tag => setTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])

  return (
    <section id="sec-dropdown" className="card">
      <SectionHeader num="09" title={t('sec09Title')} locator="id" tip="tip09" />
      <p className="desc">{t('sec09Desc')}</p>
      <label className="field-label" htmlFor="country-select">{t('labelCountry')}</label>
      <select id="country-select" value={country} onChange={e => setCountry(e.target.value)}>
        <option value="">{t('selectCountryDefault')}</option>
        {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>
      {country && <Output id="selected-country">{t('selectedCountry', { country })}</Output>}
      <label className="field-label">{t('labelSkillsMulti')}</label>
      <div id="tag-selector" className="tag-selector">
        {tagList.map((tag, i) => (
          <button key={i} type="button" data-tag={tag}
            className={`tag-btn ${tags.includes(tag) ? 'tag-active' : ''}`}
            onClick={() => toggleTag(tag)}>{tag}</button>
        ))}
      </div>
      {tags.length > 0 && <Output id="selected-tags">{t('selectedTags', { tags: tags.join(', ') })}</Output>}
    </section>
  )
}

// ─── 25. Ratings ─────────────────────────────────────────────────────────────
// Three builds of a star rating: native radio inputs, a custom role="slider"
// with half stars (hover previews, click commits, arrow keys step by 0.5), and
// a read-only display.
const STAR_VALUES = [1, 2, 3, 4, 5]
const READONLY_RATING = 3.5

/**
 * How a star should be drawn for a rating.
 * @param value The rating, in steps of 0.5.
 * @param star The star's number, 1–5.
 * @returns "full" | "half" | "empty".
 */
function starFill(value, star) {
  if (value >= star) return 'full'
  if (value >= star - 0.5) return 'half'
  return 'empty'
}

/** The three star ratings described above. */
export function RatingsSection() {
  const { t, lang } = useLang()
  const [product, setProduct] = useState(0)
  const [half, setHalf]       = useState(0)
  const [hover, setHover]     = useState(null)
  const rtl = lang === 'ar'

  /**
   * The half-star rating under the pointer.
   * The first half of a star (left in LTR, right in RTL) is worth n - 0.5.
   */
  function valueFromPointer(e, star) {
    const rect = e.currentTarget.getBoundingClientRect()
    const fromStart = rtl ? rect.right - e.clientX : e.clientX - rect.left
    return fromStart < rect.width / 2 ? star - 0.5 : star
  }

  /** Slider keys: arrows step by 0.5 (left/right swap in RTL), Home → 0, End → 5. */
  function handleKey(e) {
    const inc = rtl ? 'ArrowLeft' : 'ArrowRight'
    const dec = rtl ? 'ArrowRight' : 'ArrowLeft'
    let next = null
    if (e.key === inc || e.key === 'ArrowUp')        next = Math.min(5, half + 0.5)
    else if (e.key === dec || e.key === 'ArrowDown') next = Math.max(0, half - 0.5)
    else if (e.key === 'Home')                       next = 0
    else if (e.key === 'End')                        next = 5
    if (next === null) return
    e.preventDefault()
    setHalf(next)
  }

  // Hovering previews a rating; leaving the stars shows the committed one again.
  const shown = hover ?? half

  return (
    <section id="sec-ratings" className="card">
      <SectionHeader num="25" title={t('sec25Title')} locator="name / role=slider / data-value" tip="tip25" />
      <p className="desc">{t('sec25Desc')}</p>

      <fieldset className="rating-group">
        <legend className="field-label">{t('ratingProductLabel')}</legend>
        <div className="rating-stars">
          {STAR_VALUES.map(n => (
            <label key={n} htmlFor={`rating-star-${n}`} title={t('ratingStarN', { n })}>
              <input type="radio" className="visually-hidden" name="rating-product"
                id={`rating-star-${n}`} value={n} checked={product === n}
                onChange={() => setProduct(n)} />
              <span className="star" data-fill={starFill(product, n)} aria-hidden="true">★</span>
              <span className="visually-hidden">{t('ratingStarN', { n })}</span>
            </label>
          ))}
        </div>
        <div className="rating-row">
          <Output id="rating-product-output">
            {product ? t('ratingYouRated', { n: product }) : t('ratingNone')}
          </Output>
          <button id="rating-product-clear" className="btn-secondary" disabled={!product}
            onClick={() => setProduct(0)}>{t('ratingClear')}</button>
        </div>
      </fieldset>

      <div className="rating-group">
        <span className="field-label" id="rating-half-label">{t('ratingHalfLabel')}</span>
        <div className="rating-stars rating-half" role="slider" tabIndex={0}
          data-testid="rating-half" aria-labelledby="rating-half-label"
          aria-valuemin={0} aria-valuemax={5} aria-valuenow={half}
          aria-valuetext={t('ratingValueText', { n: half })}
          data-value={half} data-hover-value={hover ?? undefined}
          onKeyDown={handleKey} onMouseLeave={() => setHover(null)}>
          {STAR_VALUES.map(n => (
            <span key={n} className="star" data-star={n} data-fill={starFill(shown, n)}
              onMouseMove={e => setHover(valueFromPointer(e, n))}
              onClick={e => setHalf(valueFromPointer(e, n))}>★</span>
          ))}
        </div>
        <div className="rating-row">
          <Output id="rating-half-output">
            {hover !== null
              ? t('ratingPreview', { n: hover })
              : half ? t('ratingYouRated', { n: half }) : t('ratingNone')}
          </Output>
          <button id="rating-half-clear" className="btn-secondary" disabled={!half}
            onClick={() => setHalf(0)}>{t('ratingClear')}</button>
        </div>
      </div>

      <div className="rating-group">
        <span className="field-label">{t('ratingReadonlyLabel')}</span>
        <div className="rating-row">
          <div className="rating-stars rating-readonly" role="img" data-testid="rating-readonly"
            data-value={READONLY_RATING} aria-label={t('ratingValueText', { n: READONLY_RATING })}>
            {STAR_VALUES.map(n => (
              <span key={n} className="star" data-fill={starFill(READONLY_RATING, n)} aria-hidden="true">★</span>
            ))}
          </div>
          <span className="rating-count">{t('ratingReviews', { n: READONLY_RATING, count: 128 })}</span>
        </div>
      </div>
    </section>
  )
}
