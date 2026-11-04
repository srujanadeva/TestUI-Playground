// Text for the Playground sections in selection.jsx.
export default {
  en: {
    // ── Section titles ──
    sec07Title: 'Checkboxes',
    sec08Title: 'Radio Group',
    sec09Title: 'Dropdown & Tags',

    // ── Section descriptions ──
    sec07Desc: 'Tick the skills you know. The line below lists what is ticked.',
    sec08Desc: 'Choose one plan. Picking another plan clears the first, as radio buttons do.',
    sec09Desc: 'Choose a country from the list, and click tags to switch them on or off.',

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
    sec25Desc:           'Three star ratings: one you click, one that takes half stars, and one you can only read.',
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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip07Steps: [
      'Tick a few boxes, by clicking either the box or its name.',
      'Untick one and watch the list update.',
    ],
    tip07Check: 'each box\'s checked state and the text of #checkbox-summary. Clicking the name ticks the box too, because of label[for].',
    tip08Steps: [
      'Click a plan card.',
      'Click a different plan: only one stays selected.',
    ],
    tip08Check: 'exactly one input[name="plan-type"] is checked, and #selected-plan names it.',
    tip09Steps: [
      'Open the Country list and pick one.',
      'Click several tags; click one again to switch it off.',
    ],
    tip09Check: 'the list\'s selected value (#selected-country), and which tags have the tag-active class (#selected-tags).',
    tip25Steps: [
      'Click a star in the first row; Clear removes the rating.',
      'In the second row, hover to preview and click to set. Click the left half of a star for a half star (the right half in Arabic).',
      'Or click the second row and use the arrow keys, Home and End.',
    ],
    tip25Check: 'data-value or aria-valuenow, not the colour of the stars.',
  },

  ar: {
    // ── Section titles ──
    sec07Title: 'مربعات الاختيار',
    sec08Title: 'مجموعة الاختيار',
    sec09Title: 'القائمة المنسدلة والعلامات',

    // ── Section descriptions ──
    sec07Desc: 'حدّد المهارات التي تعرفها. يعرض السطر في الأسفل ما تم تحديده.',
    sec08Desc: 'اختر خطة واحدة. اختيار خطة أخرى يلغي الأولى، كما تفعل أزرار الاختيار.',
    sec09Desc: 'اختر بلدًا من القائمة، وانقر على العلامات لتفعيلها أو إلغائها.',

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
    sec25Desc:           'ثلاثة تقييمات بالنجوم: واحد تنقر عليه، وآخر يقبل أنصاف النجوم، وثالث للقراءة فقط.',
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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip07Steps: [
      'حدّد بعض المربعات، بالنقر على المربع أو على اسمه.',
      'ألغِ تحديد أحدها وراقب القائمة تتحدّث.',
    ],
    tip07Check: 'حالة التحديد لكل مربع ونص #checkbox-summary. النقر على الاسم يحدّد المربع أيضًا بفضل label[for].',
    tip08Steps: [
      'انقر على بطاقة خطة.',
      'انقر على خطة مختلفة: تبقى واحدة فقط محددة.',
    ],
    tip08Check: 'أن عنصرًا واحدًا فقط من input[name="plan-type"] محدد، وأن #selected-plan يذكر اسمه.',
    tip09Steps: [
      'افتح قائمة «البلد» واختر واحدًا.',
      'انقر على عدة علامات؛ وانقر على إحداها مرة أخرى لإلغائها.',
    ],
    tip09Check: 'القيمة المختارة في القائمة كما في #selected-country، والعلامات التي تحمل الصنف tag-active كما في #selected-tags.',
    tip25Steps: [
      'انقر على نجمة في الصف الأول؛ و«مسح» يزيل التقييم.',
      'في الصف الثاني مرّر الماوس للمعاينة وانقر للتثبيت. انقر على النصف الأيمن من النجمة لنصف نجمة (النصف الأيسر في الإنجليزية).',
      'أو انقر على الصف الثاني واستخدم مفاتيح الأسهم و Home و End.',
    ],
    tip25Check: 'قيمة data-value أو aria-valuenow، وليس لون النجوم.',
  },
}
