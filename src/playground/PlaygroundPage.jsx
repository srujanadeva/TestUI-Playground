// The home page ("/"): every numbered practice section, in sidebar order, plus the
// footer. The sections themselves live in the group files imported below.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { NAV } from '../layout/Sidebar.jsx'
import { flashSection } from '../ui.jsx'
import { TextInputSection, PasswordTextareaSection, DatePickerSection, SliderSection, FileUploadSection, FormValidationSection } from './inputs.jsx'
import { CheckboxSection, RadioSection, DropdownSection, RatingsSection } from './selection.jsx'
import { ClickCounterSection, DoubleClickSection, DynamicButtonsSection } from './buttons.jsx'
import { HoverSection, FocusBlurSection, DragDropSection, SignatureSection } from './events.jsx'
import { PopupsSection, LinksWindowsSection, PopupAlertsSection, SnackbarSection } from './windows.jsx'
import { ShadowDOMSection, PaginationTableSection, ShowHideSection, ConditionalFieldsSection, DelayedWidgetSection } from './advanced.jsx'
import { ProgressSection, StepperSection } from './workflows.jsx'

// ─── Playground (the original practice page) ─────────────────────────────────
/**
 * The home page: every numbered section, plus the footer.
 * @param contentRef The scrolling <main> element, used as the scroll root.
 * @param setActive Called with the id of the section currently in view.
 */
export default function Playground({ contentRef, setActive }) {
  const { t } = useLang()
  const location = useLocation()

  // Scroll-spy: a section counts as "in view" once it reaches a band in the upper
  // part of the scroll area (the rootMargin trims 10% off the top and 55% off the bottom).
  // Cards in one grid row enter the band together, so the current section is kept
  // while it is still in view; otherwise the first one in sidebar order wins.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const inView = new Set()
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id))
        const first = NAV.find(n => inView.has(n.id))
        if (first) setActive(current => inView.has(current) ? current : first.id)
      },
      { root: content, threshold: 0.25, rootMargin: '-10% 0px -55% 0px' }
    )
    NAV.forEach(n => { const el = document.getElementById(n.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [contentRef, setActive])

  // Scroll to hash on mount (when navigated from another route with /#sec-id).
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    // Wait a frame so the sections have rendered before scrolling to one.
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      flashSection(id)
    })
  }, [location.hash])

  return (
    <>
      <div className="content-grid">
        <TextInputSection />
        <PasswordTextareaSection />
        <DatePickerSection />
        <SliderSection />
        <FileUploadSection />
        <FormValidationSection />
        <CheckboxSection />
        <RadioSection />
        <DropdownSection />
        <ClickCounterSection />
        <DoubleClickSection />
        <DynamicButtonsSection />
        <HoverSection />
        <FocusBlurSection />
        <DragDropSection />
        <PopupsSection />
        <LinksWindowsSection />
        <ShadowDOMSection />
        <PaginationTableSection />
        <ShowHideSection />
        <PopupAlertsSection />
        <ConditionalFieldsSection />
        <DelayedWidgetSection />
        <RatingsSection />
        <ProgressSection />
        <StepperSection />
        <SignatureSection />
        <SnackbarSection />
      </div>
      <footer className="site-footer">
        <span className="footer-copy">© 2026 Srujana Deva · {t('footerRights')}</span>
        <span className="footer-wit">{t('footerWit')}</span>
      </footer>
    </>
  )
}
