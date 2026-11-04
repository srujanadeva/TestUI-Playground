// Text for the Playground sections in advanced.jsx.
export default {
  en: {
    // ── Section titles ──
    sec19Title: 'Shadow DOM',
    sec20Title: 'Pagination Table',
    sec21Title: 'Show / Hide & Tabs',

    // ── Section descriptions ──
    sec19Desc: 'An input and a button inside a shadow root. Type some text and press Read to see it shown below.',
    sec20Desc: '25 employees, 5 per page. Use the page buttons, or type in the search box to filter by name, department or ID.',
    sec21Desc: 'A button opens and closes a panel, and three tabs switch the content below them.',

    // ── 19 Shadow DOM ──
    shadowBadge:       'Shadow DOM',
    shadowDesc:        'Encapsulated from the main document. Use element.shadowRoot to reach inside.',
    shadowPlaceholder: 'Shadow DOM input…',
    shadowBtnRead:     'Read',
    shadowResultInit:  'Value will appear here',
    shadowValue:       'Value: "{val}"',
    shadowEmpty:       'Enter something first',

    // ── 20 Pagination Table ──
    phSearch:       'Search name, dept, or ID…',
    colId:          'ID',
    colName:        'Name',
    colDept:        'Department',
    colRole:        'Role',
    colStatus:      'Status',
    statusActive:   'Active',
    statusInactive: 'Inactive',
    noResults:      'No matching records',
    pageInfo:       'Showing {shown} of {total} records — Page {page} of {totalPages}',

    // ── 21 Show / Hide & Tabs ──
    btnExpandPanel:   'Expand Panel',
    btnCollapsePanel: 'Collapse Panel',
    panelVisible:     'Panel is now',
    panelVisibleBold: 'visible',
    tabs:       ['Details', 'Settings', 'Preview'],
    tabContent: [
      'This is the Details tab. Assert it is visible using toBeVisible().',
      'Settings tab is active. Toggle state and verify the update.',
      'Preview tab shows the final rendered output for inspection.',
    ],

    // ── 23 Conditional Fields ──
    sec23Title:               'Conditional Fields',
    sec23Desc:                'Tick the box to show three more fields. Untick it to hide them; what you entered comes back when you tick it again.',
    conditionalToggleLabel:   'Show additional fields',
    conditionalTextLabel:     'Text field',
    conditionalTextPh:        'Type something here…',
    conditionalDropdownLabel: 'Dropdown',
    conditionalDropdownPh:    '— Select an option —',
    conditionalOpt1:          'Option Alpha',
    conditionalOpt2:          'Option Beta',
    conditionalOpt3:          'Option Gamma',
    conditionalRadioLabel:    'Radio group',
    conditionalRadioAlpha:    'Alpha',
    conditionalRadioBeta:     'Beta',
    conditionalRadioGamma:    'Gamma',
    conditionalOutput:        'Text: {text} · Dropdown: {select} · Radio: {radio}',
    navConditionalFields:     'Conditional Fields',

    // ── 24 Delayed Widget ──
    sec24Title:       'Delayed Widget',
    sec24Desc:        'The figures take 1–6 seconds to load, like a slow server. Reload runs it again with a new delay.',
    statOrders:       'Orders',
    statRevenue:      'Revenue',
    statUsers:        'Active users',
    delayedLoading:   'Loading live stats…',
    delayedLoadedIn:  'Loaded in {seconds} s',
    btnReloadWidget:  'Reload',
    navDelayedWidget: 'Delayed Widget',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip19Steps: [
      'Type in the dark box and press Read.',
      'Try to find the input with a normal page selector: it fails, because it is inside the shadow root.',
    ],
    tip19Check: 'that #shadow-output shows the typed text, reached by first finding [data-testid="shadow-host"] and then searching inside its shadowRoot.',
    tip20Steps: [
      'Click the page numbers, or ‹ › and « ».',
      'Type "eng" in the search box: only Engineering rows remain and you go back to page 1.',
      'Type something that matches nothing to see the empty message.',
    ],
    tip20Check: 'rows by [data-row-id], the active page button (.page-active), and the #page-info line.',
    tip21Steps: [
      'Press Expand Panel to open the panel; press it again to close it.',
      'Click each tab and watch the content change.',
      'Click a tab, then use the arrow keys, Home and End to move between tabs. Tab moves on to the content, not to the next tab.',
    ],
    tip21Check: 'that #collapsible-content is removed from the page when closed (the button\'s aria-expanded says which), the tab with aria-selected="true", for example getByRole(\'tab\', { selected: true }), and the text of #tab-content.',
    tip23Steps: [
      'Tick "Show additional fields".',
      'Fill in the text field, choose an option and pick a radio button.',
      'Untick and tick again: your values are still there.',
    ],
    tip23Check: 'waiting for #conditional-fields to appear before typing, and the summary in #conditional-output.',
    tip24Steps: [
      'Watch the grey placeholders turn into numbers.',
      'Press Reload to load again; the delay changes each time.',
      'Add ?delay=0 (or any number of milliseconds) to the URL for a fixed delay.',
    ],
    tip24Check: 'waiting for [data-testid="delayed-widget"] to have data-state="loaded", instead of a fixed sleep.',
  },

  ar: {
    // ── Section titles ──
    sec19Title: 'نموذج DOM الظلي',
    sec20Title: 'جدول مع ترقيم الصفحات',
    sec21Title: 'إظهار / إخفاء والتبويبات',

    // ── Section descriptions ──
    sec19Desc: 'حقل وزر داخل جذر ظل (shadow root). اكتب نصًا واضغط «قراءة» ليظهر في الأسفل.',
    sec20Desc: '25 موظفًا، 5 في كل صفحة. استخدم أزرار الصفحات، أو اكتب في مربع البحث للفلترة بالاسم أو القسم أو المعرّف.',
    sec21Desc: 'زر يفتح لوحة ويغلقها، وثلاثة تبويبات تبدّل المحتوى تحتها.',

    // ── 19 Shadow DOM ──
    shadowBadge:       'نموذج DOM الظلي',
    shadowDesc:        'محاط من المستند الرئيسي. استخدم element.shadowRoot للوصول إلى الداخل.',
    shadowPlaceholder: 'إدخال DOM الظلي…',
    shadowBtnRead:     'قراءة',
    shadowResultInit:  'ستظهر القيمة هنا',
    shadowValue:       'القيمة: "{val}"',
    shadowEmpty:       'أدخل شيئًا أولاً',

    // ── 20 Pagination Table ──
    phSearch:       'ابحث بالاسم أو القسم أو المعرف…',
    colId:          'المعرف',
    colName:        'الاسم',
    colDept:        'القسم',
    colRole:        'الدور',
    colStatus:      'الحالة',
    statusActive:   'نشط',
    statusInactive: 'غير نشط',
    noResults:      'لا توجد سجلات مطابقة',
    pageInfo:       'عرض {shown} من {total} سجل — الصفحة {page} من {totalPages}',

    // ── 21 Show / Hide & Tabs ──
    btnExpandPanel:   'توسيع اللوحة',
    btnCollapsePanel: 'طي اللوحة',
    panelVisible:     'اللوحة',
    panelVisibleBold: 'ظاهرة الآن',
    tabs:       ['التفاصيل', 'الإعدادات', 'المعاينة'],
    tabContent: [
      'هذا هو تبويب التفاصيل. تأكد من ظهوره باستخدام toBeVisible().',
      'تبويب الإعدادات نشط. بدّل الحالة وتحقق من التحديث.',
      'تبويب المعاينة يعرض الناتج النهائي المُصيَّر للفحص.',
    ],

    // ── 23 Conditional Fields ──
    sec23Title:               'الحقول الشرطية',
    sec23Desc:                'حدّد المربع لإظهار ثلاثة حقول إضافية. ألغِ التحديد لإخفائها؛ وتعود قيمك عند التحديد مرة أخرى.',
    conditionalToggleLabel:   'عرض الحقول الإضافية',
    conditionalTextLabel:     'حقل النص',
    conditionalTextPh:        'اكتب شيئاً هنا…',
    conditionalDropdownLabel: 'القائمة المنسدلة',
    conditionalDropdownPh:    '— اختر خياراً —',
    conditionalOpt1:          'الخيار ألفا',
    conditionalOpt2:          'الخيار بيتا',
    conditionalOpt3:          'الخيار غاما',
    conditionalRadioLabel:    'مجموعة الاختيار',
    conditionalRadioAlpha:    'ألفا',
    conditionalRadioBeta:     'بيتا',
    conditionalRadioGamma:    'غاما',
    conditionalOutput:        'النص: {text} · القائمة: {select} · الاختيار: {radio}',
    navConditionalFields:     'الحقول الشرطية',

    // ── 24 Delayed Widget ──
    sec24Title:       'عنصر متأخر التحميل',
    sec24Desc:        'تستغرق الأرقام من 1 إلى 6 ثوانٍ للتحميل، مثل خادم بطيء. «إعادة التحميل» يشغّلها مجددًا بتأخير جديد.',
    statOrders:       'الطلبات',
    statRevenue:      'الإيرادات',
    statUsers:        'المستخدمون النشطون',
    delayedLoading:   'جارٍ تحميل الإحصاءات…',
    delayedLoadedIn:  'تم التحميل في {seconds} ث',
    btnReloadWidget:  'إعادة التحميل',
    navDelayedWidget: 'عنصر متأخر التحميل',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip19Steps: [
      'اكتب في المربع الداكن واضغط «قراءة».',
      'حاول العثور على الحقل بمحدد عادي في الصفحة: يفشل، لأنه داخل جذر الظل.',
    ],
    tip19Check: 'أن #shadow-output يعرض النص المكتوب، بعد الوصول إليه بالعثور على [data-testid="shadow-host"] أولاً ثم البحث داخل shadowRoot الخاص به.',
    tip20Steps: [
      'انقر على أرقام الصفحات، أو ‹ › و « ».',
      'اكتب "eng" في مربع البحث: تبقى صفوف Engineering فقط وتعود إلى الصفحة 1.',
      'اكتب شيئًا لا يطابق أي صف لترى رسالة عدم وجود نتائج.',
    ],
    tip20Check: 'الصفوف عبر [data-row-id]، وزر الصفحة النشطة (.page-active)، وسطر #page-info.',
    tip21Steps: [
      'اضغط «توسيع اللوحة» لفتحها؛ واضغطه مرة أخرى لإغلاقها.',
      'انقر على كل تبويب وراقب المحتوى يتغيّر.',
      'انقر على تبويب ثم استخدم مفاتيح الأسهم و Home و End للتنقل بين التبويبات. مفتاح Tab ينقلك إلى المحتوى لا إلى التبويب التالي.',
    ],
    tip21Check: 'أن #collapsible-content يُزال من الصفحة عند الإغلاق (وتوضح ذلك خاصية aria-expanded على الزر)، والتبويب الذي يحمل aria-selected="true"، مثل getByRole(\'tab\', { selected: true })، ونص #tab-content.',
    tip23Steps: [
      'حدّد «عرض الحقول الإضافية».',
      'املأ الحقل النصي واختر خيارًا وحدّد زر اختيار.',
      'ألغِ التحديد ثم حدّد مرة أخرى: قيمك لا تزال موجودة.',
    ],
    tip23Check: 'انتظار ظهور #conditional-fields قبل الكتابة، والملخص في #conditional-output.',
    tip24Steps: [
      'راقب العناصر الرمادية المؤقتة تتحوّل إلى أرقام.',
      'اضغط «إعادة التحميل» للتحميل مجددًا؛ يتغيّر التأخير في كل مرة.',
      'أضف ?delay=0 (أو أي عدد من الملي ثانية) إلى الرابط لتأخير ثابت.',
    ],
    tip24Check: 'انتظار أن يحمل [data-testid="delayed-widget"] القيمة data-state="loaded" بدلاً من الانتظار الثابت.',
  },
}
