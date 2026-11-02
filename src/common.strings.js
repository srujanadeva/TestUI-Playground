// App-wide text: the app name, the language toggle, the footer and the greeting
// shown in every themed page's hero. Merged with the feature strings in i18n.jsx.
export default {
  en: {
    // ── Language toggle ──
    langToggle: 'عربي',

    // ── App title ──
    appName: 'Test Playground',

    // ── Page hero greeting (every themed page) ──
    mediaHeroWelcome:  'Welcome, {name}',

    // ── Footer ──
    footerRights: 'All rights reserved · Not for commercial use',
    footerWit:    'findElement(By.Copyright, "violator") → NoSuchElementException',
  },

  ar: {
    // ── Language toggle ──
    langToggle: 'English',

    // ── App title ──
    appName: 'ملعب الاختبار',

    // ── Page hero greeting (every themed page) ──
    mediaHeroWelcome:  'مرحباً، {name}',

    // ── Footer ──
    footerRights: 'جميع الحقوق محفوظة · غير مخصص للاستخدام التجاري',
    footerWit:    'findElement(By.Copyright, "violator") → NoSuchElementException',
  },
}
