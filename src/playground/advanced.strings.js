// Text for the Playground sections in advanced.jsx.
export default {
  en: {
    // ── Section titles ──
    sec19Title: 'Shadow DOM',
    sec20Title: 'Pagination Table',
    sec21Title: 'Show / Hide & Tabs',

    // ── Section descriptions ──
    sec19Desc: 'Elements encapsulated in a shadow root.',
    sec20Desc: '25 rows, 5 per page. Filter by name, department, or ID.',
    sec21Desc: 'Collapsible panel and tab switching for visibility assertions.',

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
    sec23Desc:                'Check the box to reveal hidden fields. Great for practising waitForElement, asserting visibility, and chaining interactions.',
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
    sec24Desc:        'Loads 1–6 seconds after the page, like a slow API. Wait for data-state="loaded" instead of sleeping. Add ?delay=<ms> to the URL for a fixed delay.',
    statOrders:       'Orders',
    statRevenue:      'Revenue',
    statUsers:        'Active users',
    delayedLoading:   'Loading live stats…',
    delayedLoadedIn:  'Loaded in {seconds} s',
    btnReloadWidget:  'Reload',
    navDelayedWidget: 'Delayed Widget',
  },

  ar: {
    // ── Section titles ──
    sec19Title: 'نموذج DOM الظلي',
    sec20Title: 'جدول مع ترقيم الصفحات',
    sec21Title: 'إظهار / إخفاء والتبويبات',

    // ── Section descriptions ──
    sec19Desc: 'عناصر محاطة في جذر ظل.',
    sec20Desc: '25 صفًا، 5 في كل صفحة. الفلترة بالاسم أو القسم أو المعرف.',
    sec21Desc: 'لوحة قابلة للطي وتبديل التبويبات لتأكيدات الظهور.',

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
    sec23Desc:                'حدّد المربع لإظهار الحقول المخفية. مثالي للتدرب على waitForElement والتحقق من الظهور والتفاعل المتسلسل.',
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
    sec24Desc:        'يُحمَّل بعد 1–6 ثوانٍ من الصفحة، مثل واجهة برمجية بطيئة. انتظر data-state="loaded" بدلاً من الانتظار الثابت. أضف ?delay=<ms> إلى الرابط لتأخير ثابت.',
    statOrders:       'الطلبات',
    statRevenue:      'الإيرادات',
    statUsers:        'المستخدمون النشطون',
    delayedLoading:   'جارٍ تحميل الإحصاءات…',
    delayedLoadedIn:  'تم التحميل في {seconds} ث',
    btnReloadWidget:  'إعادة التحميل',
    navDelayedWidget: 'عنصر متأخر التحميل',
  },
}
