// Text for the Playground sections in selection.jsx.
export default {
  en: {
    // ── Section titles ──
    sec07Title: 'Checkboxes',
    sec08Title: 'Radio Group',
    sec09Title: 'Dropdown & Tags',

    // ── Section descriptions ──
    sec07Desc: 'Multi-select using labeled checkboxes.',
    sec08Desc: 'Single selection via radio buttons.',
    sec09Desc: 'Native select and a custom tag multi-select.',

    // ── 07 Checkboxes ──
    nothingSelected: 'Nothing selected',
    selectedSkills:  'Selected: {skills}',
    skills: ['JavaScript', 'Python', 'Java', 'Rust', 'Go', 'TypeScript'],

    // ── 08 Radio Group ──
    planFreeDesc:       'Basic features',
    planProDesc:        'Advanced tools',
    planEnterpriseDesc: 'Full access',
    selectedPlan:       'Selected: {plan}',

    // ── 09 Dropdown & Tags ──
    labelCountry:         'Country',
    selectCountryDefault: '-- Select a country --',
    labelSkillsMulti:     'Skills (multi-select)',
    selectedCountry:      'Country: {country}',
    selectedTags:         'Tags: {tags}',
    countries: ['Australia', 'Germany', 'India', 'Japan', 'United Kingdom', 'United States'],
    tagList:   ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Testing', 'Design'],

    // ── 25 Ratings ──
    sec25Title:          'Ratings',
    sec25Desc:           'Three star ratings: radio inputs, a custom slider with half stars (hover previews, click commits, arrow keys step by 0.5) and a read-only display. Assert data-value or aria-valuenow, not star colours.',
    ratingProductLabel:  'Rate this product (radio inputs)',
    ratingHalfLabel:     'Rate the delivery (half stars)',
    ratingReadonlyLabel: 'Average rating (read-only)',
    ratingStarN:         '{n} stars',
    ratingValueText:     '{n} out of 5',
    ratingYouRated:      'You rated {n} out of 5',
    ratingPreview:       'Preview: {n} out of 5',
    ratingNone:          'No rating yet',
    ratingClear:         'Clear',
    ratingReviews:       '{n} from {count} reviews',
    navRatings:          'Ratings',
  },

  ar: {
    // ── Section titles ──
    sec07Title: 'مربعات الاختيار',
    sec08Title: 'مجموعة الاختيار',
    sec09Title: 'القائمة المنسدلة والعلامات',

    // ── Section descriptions ──
    sec07Desc: 'تحديد متعدد باستخدام مربعات اختيار مسماة.',
    sec08Desc: 'تحديد واحد عبر أزرار الاختيار.',
    sec09Desc: 'قائمة منسدلة أصلية وتحديد علامات مخصص.',

    // ── 07 Checkboxes ──
    nothingSelected: 'لم يتم اختيار شيء',
    selectedSkills:  'المحدد: {skills}',
    skills: ['جافا سكريبت', 'بايثون', 'جافا', 'رست', 'جو', 'تايب سكريبت'],

    // ── 08 Radio Group ──
    planFreeDesc:       'الميزات الأساسية',
    planProDesc:        'أدوات متقدمة',
    planEnterpriseDesc: 'وصول كامل',
    selectedPlan:       'المحدد: {plan}',

    // ── 09 Dropdown & Tags ──
    labelCountry:         'البلد',
    selectCountryDefault: '-- اختر بلدًا --',
    labelSkillsMulti:     'المهارات (تحديد متعدد)',
    selectedCountry:      'البلد: {country}',
    selectedTags:         'العلامات: {tags}',
    countries: ['أستراليا', 'ألمانيا', 'الهند', 'اليابان', 'المملكة المتحدة', 'الولايات المتحدة'],
    tagList:   ['الواجهة الأمامية', 'الخلفية', 'الجوال', 'DevOps', 'الاختبار', 'التصميم'],

    // ── 25 Ratings ──
    sec25Title:          'التقييمات',
    sec25Desc:           'ثلاثة تقييمات بالنجوم: أزرار اختيار، ومنزلق مخصص بأنصاف النجوم (التمرير يعرض معاينة، والنقر يثبّت، والأسهم تغيّر بمقدار 0.5)، وعرض للقراءة فقط. تحقق من data-value أو aria-valuenow وليس من ألوان النجوم.',
    ratingProductLabel:  'قيّم هذا المنتج (أزرار اختيار)',
    ratingHalfLabel:     'قيّم التوصيل (أنصاف نجوم)',
    ratingReadonlyLabel: 'متوسط التقييم (للقراءة فقط)',
    ratingStarN:         '{n} نجوم',
    ratingValueText:     '{n} من 5',
    ratingYouRated:      'قيّمت {n} من 5',
    ratingPreview:       'معاينة: {n} من 5',
    ratingNone:          'لا يوجد تقييم بعد',
    ratingClear:         'مسح',
    ratingReviews:       '{n} من {count} مراجعة',
    navRatings:          'التقييمات',
  },
}
