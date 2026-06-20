import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // ── Language toggle ──
    langToggle: 'عربي',

    // ── App title ──
    appName: 'Test Playground',

    // ── Sidebar nav groups ──
    navInputs:     'Inputs',
    navSelection:  'Selection',
    navButtons:    'Buttons',
    navEvents:     'Events',
    navWindows:    'Windows',
    navAdvanced:   'Advanced',
    navDataTables: 'Data & Tables',

    // ── Nav item labels ──
    navTextInput:        'Text Input',
    navPasswordTextarea: 'Password & Textarea',
    navDatePicker:       'Date Picker',
    navSlider:           'Slider',
    navFileUpload:       'File Upload',
    navFormValidation:   'Form Validation',
    navCheckboxes:       'Checkboxes',
    navRadioGroup:       'Radio Group',
    navDropdownTags:     'Dropdown & Tags',
    navClickCounter:     'Click Counter',
    navDoubleClick:      'Double Click',
    navDynamicButtons:   'Dynamic Buttons',
    navMouseHover:       'Mouse Hover',
    navFocusBlur:        'Focus / Blur',
    navDragDrop:         'Drag & Drop',
    navBrowserPopups:    'Browser Popups',
    navLinksWindows:     'Links & Windows',
    navPopupAlerts:      'Popup Alerts',
    navIFrame:           'iFrame',
    navShadowDOM:        'Shadow DOM',
    navPaginationTable:  'Pagination Table',
    navShowHide:         'Show / Hide & Tabs',

    // ── Section titles ──
    sec01Title: 'Text Input',
    sec02Title: 'Password & Textarea',
    sec03Title: 'Date Picker',
    sec04Title: 'Range Slider',
    sec05Title: 'File Upload',
    sec06Title: 'Form Validation',
    sec07Title: 'Checkboxes',
    sec08Title: 'Radio Group',
    sec09Title: 'Dropdown & Tags',
    sec10Title: 'Button Click Counter',
    sec11Title: 'Double Click',
    sec12Title: 'Dynamic Buttons',
    sec13Title: 'Mouse Hover',
    sec14Title: 'Focus / Blur',
    sec15Title: 'Drag & Drop',
    sec16Title: 'Browser Popups',
    sec17Title: 'Links & New Windows',
    sec18Title: 'iFrame',
    sec19Title: 'Shadow DOM',
    sec20Title: 'Pagination Table',
    sec21Title: 'Show / Hide & Tabs',
    sec22Title: 'Popup Alerts',

    // ── Section descriptions ──
    sec01Desc: 'Type a name and click Greet.',
    sec02Desc: 'Password with show/hide toggle. Textarea for multi-line input.',
    sec03Desc: 'Single date and date-range inputs.',
    sec04Desc: 'Numeric sliders for continuous values.',
    sec05Desc: 'Click to browse or drag-and-drop files onto the zone.',
    sec06Desc: 'Multi-field form with inline validation messages.',
    sec07Desc: 'Multi-select using labeled checkboxes.',
    sec08Desc: 'Single selection via radio buttons.',
    sec09Desc: 'Native select and a custom tag multi-select.',
    sec10Desc: 'Three independently tracked buttons. Verify counts in assertions.',
    sec11Desc: 'Single-click, double-click, and right-click are distinct events.',
    sec12Desc: 'Buttons that change state, appear, and disappear at runtime.',
    sec13Desc: 'Hover over a card to reveal its tooltip.',
    sec14Desc: 'Tab through fields — focus and blur events are captured.',
    sec15Desc: 'Drag items to reorder the list.',
    sec16Desc: 'Native browser alert, prompt, and confirm dialogs.',
    sec17Desc: 'Anchor links, JS-opened tabs and windows.',
    sec18Desc: 'Embedded page in an iframe. Elements live in a separate DOM context.',
    sec19Desc: 'Elements encapsulated in a shadow root.',
    sec20Desc: '25 rows, 5 per page. Filter by name, department, or ID.',
    sec21Desc: 'Collapsible panel and tab switching for visibility assertions.',
    sec22Desc: 'Trigger warning, error, and exception modal overlays.',

    // ── 01 Text Input ──
    phEnterName:   'Enter your name',
    btnGreet:      'Greet',
    greetingHello: 'Hello, {name}!',

    // ── 02 Password & Textarea ──
    phPassword: 'Enter password',
    btnShow:    'Show',
    btnHide:    'Hide',
    phNotes:    'Enter notes here…',
    charCount:  'Characters: {n}',

    // ── 03 Date Picker ──
    labelSingleDate: 'Single date',
    labelFrom:       'From',
    labelTo:         'To',
    selectedDate:    'Selected: {date}',
    dateRange:       'Range: {from} → {to}',

    // ── 04 Range Slider ──
    labelQty:        'Quantity: {n}',
    labelBrightness: 'Brightness: {n}%',

    // ── 05 File Upload ──
    dropOrBrowse: 'Drop files here or',
    dropBrowse:   'browse',
    dropHint:     'Accepts: PDF, PNG, JPG, CSV, XLSX',

    // ── 06 Form Validation ──
    labelEmail:      'Email',
    labelPhone:      'Phone',
    labelPassword:   'Password',
    phEmailField:    'your@email.com',
    phPhoneField:    '10-digit number',
    phPasswordField: 'Min 8 characters',
    ariaEmail:       'Email address',
    ariaPhone:       'Phone number',
    ariaPassword:    'Password',
    errEmail:        'Enter a valid email address',
    errPhone:        'Phone must be exactly 10 digits',
    errPassword:     'Password must be at least 8 characters',
    btnSubmit:       'Submit',
    formSuccess:     'Form submitted successfully!',

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

    // ── 10 Click Counter ──
    btnPrimary: 'Primary',
    btnSuccess: 'Success',
    btnDanger:  'Danger',
    btnReset:   'Reset',

    // ── 11 Double Click ──
    clickAreaLabel: 'Click · Double-Click · Right-Click here',
    evtSingleClick: 'single click',
    evtDoubleClick: 'double click',
    evtRightClick:  'right click',

    // ── 12 Dynamic Buttons ──
    btnStartLoading: 'Start Loading',
    btnLoading:      'Loading…',
    btnDone:         'Done!',
    btnDisappear:    'Disappear',
    btnReappear:     'Reappear',
    btnAddButton:    'Add Button',
    btnRemove:       '× Remove ({id})',

    // ── 13 Mouse Hover ──
    hoverInfo:    'Info',
    hoverWarning: 'Warning',
    hoverSuccess: 'Success',
    hoverDanger:  'Danger',
    tipInfo:      'Tooltip: information message',
    tipWarning:   'Tooltip: something needs attention',
    tipSuccess:   'Tooltip: action was successful',
    tipDanger:    'Tooltip: destructive action',

    // ── 14 Focus / Blur ──
    focusUsername: 'Username',
    focusEmail:    'Email',
    focusComment:  'Comment',
    phFocusField:  'Click to focus {field}',
    focusFields:   ['Username', 'Email', 'Comment'],

    // ── 15 Drag & Drop ──
    dragAlpha:   'Alpha Task',
    dragBeta:    'Beta Task',
    dragGamma:   'Gamma Task',
    dragDelta:   'Delta Task',
    dragEpsilon: 'Epsilon Task',
    dragMoved:   'Moved "{label}" → position {pos}',

    // ── 16 Browser Popups ──
    btnAlert:        'Alert',
    btnPrompt:       'Prompt',
    btnConfirm:      'Confirm',
    alertMsg:        'This is a browser alert!',
    promptMsg:       'What is your name?',
    confirmMsg:      'Do you confirm this action?',
    alertDismissed:  'Alert was dismissed',
    promptReturned:  'Prompt returned: "{val}"',
    promptCancelled: 'Prompt was cancelled',
    confirmOk:       'Confirmed: OK clicked',
    confirmCancel:   'Cancelled: Cancel clicked',

    // ── 17 Links & Windows ──
    linkAnchor:      'Anchor (same page)',
    linkExternal:    'External (new tab)',
    linkDownload:    'Download link',
    btnJsNewTab:     'JS New Tab',
    btnJsNewWindow:  'JS New Window',
    newTabOpened:    'New tab opened via JS',
    newWindowOpened: 'New window opened via JS',

    // ── 18 iFrame ──
    iframeBadge:       'Inside iFrame',
    iframeTitle:       'Iframe Content Area',
    iframePlaceholder: 'Type inside the iframe…',
    iframeBtnRead:     'Read',
    iframeResultInit:  'Result will appear here',

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

    // ── 22 Popup Alerts ──
    btnWarningPopup:    'Warning',
    btnErrorPopup:      'Error',
    btnExceptionPopup:  'Exception',
    popupWarningTitle:   'Warning',
    popupErrorTitle:     'Error',
    popupExceptionTitle: 'Unhandled Exception',
    popupWarningMsg:     'This action may have unintended consequences. Please review your changes before proceeding.',
    popupErrorMsg:       'An error occurred while processing your request. The operation could not be completed.',
    popupExceptionMsg:   'TypeError: Cannot read properties of undefined\n  at PaginationTable (App.jsx:42:18)\n  at renderWithHooks (react-dom.js:14906)',
    btnDismiss: 'Dismiss',

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

    // ── Sidebar (new tab) ──
    navTestPetStore: 'Test Pet Store',

    // ── Auth ──
    authLogin:           'Log in',
    authSignup:          'Sign up',
    authLogout:          'Log out',
    authAccount:         'Account',
    authForgotPassword:  'Forgot password?',
    authEmail:           'Email',
    authPassword:        'Password',
    authConfirmPassword: 'Confirm password',
    authName:            'Full name',
    authRememberMe:      'Remember me',
    authTerms:           'I agree to the terms of service',
    authShowPassword:    'Show password',
    authHidePassword:    'Hide password',
    authNoAccount:       'New here?',
    authHaveAccount:     'Already have an account?',
    authForgotPrompt:    'Enter your email and we’ll send a reset link.',
    authForgotConfirm:   'If an account exists for that email, we’d send a reset link.',
    authErrInvalid:      'Invalid email or password.',
    authErrEmailTaken:   'That email is already registered.',
    authErrMismatch:     'Passwords don’t match.',
    authErrShort:        'Password must be at least 8 characters.',
    authErrTerms:        'You must accept the terms.',
    authErrNetwork:      'Network error. Please try again.',

    // ── Account ──
    accountWelcome:       'Welcome, {name}!',
    accountMemberSince:   'Member since',
    accountGoToPetstore:  'Go to Test Pet Store',

    // ── Test Pet Store ──
    petstoreHeroTitle:    'Test Pet Store',
    petstoreHeroSubtitle: 'Manage your menagerie. Pets are stored in MongoDB and scoped to your account.',
    petstoreHeroWelcome:  'Welcome, {name}',
    petstoreStatTotal:    'Total',
    petstoreStatAvailable:'Available',
    petstoreStatPending:  'Pending',
    petstoreStatSold:     'Sold',
    petstoreFilterAll:    'All',
    petStatusAvailable:   'Available',
    petStatusPending:     'Pending',
    petStatusSold:        'Sold',
    petAdd:               'Add Pet',
    petEdit:              'Edit pet',
    petDelete:            'Delete pet',
    petName:              'Name',
    petCategory:          'Category',
    petPhotoUrls:         'Photo URLs (one per line)',
    petTags:              'Tags (comma-separated)',
    petStatus:            'Status',
    petEmptyState:        'No pets yet. Add your first companion.',
    petConfirmDelete:     'Delete {name}?',
    petSave:              'Save',
    petCancel:            'Cancel',
    toastPetAdded:        'Pet added',
    toastPetUpdated:      'Pet updated',
    toastPetDeleted:      'Pet deleted',

    // ── Footer ──
    footerRights: 'All rights reserved · Not for commercial use',
    footerWit:    'findElement(By.Copyright, "violator") → NoSuchElementException',
  },

  ar: {
    // ── Language toggle ──
    langToggle: 'English',

    // ── App title ──
    appName: 'ملعب الاختبار',

    // ── Sidebar nav groups ──
    navInputs:     'المدخلات',
    navSelection:  'الاختيار',
    navButtons:    'الأزرار',
    navEvents:     'الأحداث',
    navWindows:    'النوافذ',
    navAdvanced:   'متقدم',
    navDataTables: 'البيانات والجداول',

    // ── Nav item labels ──
    navTextInput:        'إدخال النص',
    navPasswordTextarea: 'كلمة المرور ومنطقة النص',
    navDatePicker:       'منتقي التاريخ',
    navSlider:           'شريط التمرير',
    navFileUpload:       'رفع الملف',
    navFormValidation:   'التحقق من النموذج',
    navCheckboxes:       'مربعات الاختيار',
    navRadioGroup:       'مجموعة الاختيار',
    navDropdownTags:     'القائمة المنسدلة والعلامات',
    navClickCounter:     'عداد النقرات',
    navDoubleClick:      'النقر المزدوج',
    navDynamicButtons:   'الأزرار الديناميكية',
    navMouseHover:       'تمرير الماوس',
    navFocusBlur:        'التركيز / فقدان التركيز',
    navDragDrop:         'السحب والإفلات',
    navBrowserPopups:    'النوافذ المنبثقة',
    navLinksWindows:     'الروابط والنوافذ',
    navPopupAlerts:      'تنبيهات منبثقة',
    navIFrame:           'الإطار المضمن',
    navShadowDOM:        'نموذج DOM الظلي',
    navPaginationTable:  'جدول مع ترقيم الصفحات',
    navShowHide:         'إظهار / إخفاء والتبويبات',

    // ── Section titles ──
    sec01Title: 'إدخال النص',
    sec02Title: 'كلمة المرور ومنطقة النص',
    sec03Title: 'منتقي التاريخ',
    sec04Title: 'شريط التمرير',
    sec05Title: 'رفع الملف',
    sec06Title: 'التحقق من النموذج',
    sec07Title: 'مربعات الاختيار',
    sec08Title: 'مجموعة الاختيار',
    sec09Title: 'القائمة المنسدلة والعلامات',
    sec10Title: 'عداد نقرات الزر',
    sec11Title: 'النقر المزدوج',
    sec12Title: 'الأزرار الديناميكية',
    sec13Title: 'تمرير الماوس',
    sec14Title: 'التركيز / فقدان التركيز',
    sec15Title: 'السحب والإفلات',
    sec16Title: 'النوافذ المنبثقة',
    sec17Title: 'الروابط والنوافذ الجديدة',
    sec18Title: 'الإطار المضمن',
    sec19Title: 'نموذج DOM الظلي',
    sec20Title: 'جدول مع ترقيم الصفحات',
    sec21Title: 'إظهار / إخفاء والتبويبات',
    sec22Title: 'تنبيهات منبثقة',

    // ── Section descriptions ──
    sec01Desc: 'اكتب اسمًا وانقر على ترحيب.',
    sec02Desc: 'كلمة مرور مع خيار الإظهار/الإخفاء. منطقة نص للإدخال متعدد الأسطر.',
    sec03Desc: 'إدخالات تاريخ مفرد ونطاق تاريخ.',
    sec04Desc: 'أشرطة تمرير رقمية للقيم المستمرة.',
    sec05Desc: 'انقر للتصفح أو اسحب الملفات وأفلتها على المنطقة.',
    sec06Desc: 'نموذج متعدد الحقول مع رسائل التحقق المضمّنة.',
    sec07Desc: 'تحديد متعدد باستخدام مربعات اختيار مسماة.',
    sec08Desc: 'تحديد واحد عبر أزرار الاختيار.',
    sec09Desc: 'قائمة منسدلة أصلية وتحديد علامات مخصص.',
    sec10Desc: 'ثلاثة أزرار يتم تتبعها بشكل مستقل. تحقق من الأعداد في التأكيدات.',
    sec11Desc: 'نقرة واحدة، ونقر مزدوج، ونقر بالزر الأيمن أحداث مميزة.',
    sec12Desc: 'أزرار تغير حالتها، تظهر، وتختفي أثناء التشغيل.',
    sec13Desc: 'مرر الماوس فوق بطاقة لإظهار تلميحها.',
    sec14Desc: 'تنقل بين الحقول — يتم التقاط أحداث التركيز وفقدانه.',
    sec15Desc: 'اسحب العناصر لإعادة ترتيب القائمة.',
    sec16Desc: 'مربعات حوار التنبيه والمطالبة والتأكيد الأصلية للمتصفح.',
    sec17Desc: 'روابط مرساة، تبويبات ونوافذ تُفتح عبر JavaScript.',
    sec18Desc: 'صفحة مضمّنة في إطار. العناصر تعيش في سياق DOM منفصل.',
    sec19Desc: 'عناصر محاطة في جذر ظل.',
    sec20Desc: '25 صفًا، 5 في كل صفحة. الفلترة بالاسم أو القسم أو المعرف.',
    sec21Desc: 'لوحة قابلة للطي وتبديل التبويبات لتأكيدات الظهور.',
    sec22Desc: 'تشغيل تراكبات نمط التحذير والخطأ والاستثناء.',

    // ── 01 Text Input ──
    phEnterName:   'أدخل اسمك',
    btnGreet:      'ترحيب',
    greetingHello: 'مرحبا، {name}!',

    // ── 02 Password & Textarea ──
    phPassword: 'أدخل كلمة المرور',
    btnShow:    'إظهار',
    btnHide:    'إخفاء',
    phNotes:    'أدخل ملاحظاتك هنا…',
    charCount:  'عدد الأحرف: {n}',

    // ── 03 Date Picker ──
    labelSingleDate: 'تاريخ مفرد',
    labelFrom:       'من',
    labelTo:         'إلى',
    selectedDate:    'المحدد: {date}',
    dateRange:       'النطاق: {from} → {to}',

    // ── 04 Range Slider ──
    labelQty:        'الكمية: {n}',
    labelBrightness: 'السطوع: {n}%',

    // ── 05 File Upload ──
    dropOrBrowse: 'أفلت الملفات هنا أو',
    dropBrowse:   'تصفح',
    dropHint:     'يقبل: PDF, PNG, JPG, CSV, XLSX',

    // ── 06 Form Validation ──
    labelEmail:      'البريد الإلكتروني',
    labelPhone:      'الهاتف',
    labelPassword:   'كلمة المرور',
    phEmailField:    'بريدك@example.com',
    phPhoneField:    'رقم مكون من 10 أرقام',
    phPasswordField: '8 أحرف على الأقل',
    ariaEmail:       'عنوان البريد الإلكتروني',
    ariaPhone:       'رقم الهاتف',
    ariaPassword:    'كلمة المرور',
    errEmail:        'أدخل عنوان بريد إلكتروني صالح',
    errPhone:        'يجب أن يتكون الهاتف من 10 أرقام بالضبط',
    errPassword:     'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    btnSubmit:       'إرسال',
    formSuccess:     'تم إرسال النموذج بنجاح!',

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

    // ── 10 Click Counter ──
    btnPrimary: 'أساسي',
    btnSuccess: 'نجاح',
    btnDanger:  'خطر',
    btnReset:   'إعادة تعيين',

    // ── 11 Double Click ──
    clickAreaLabel: 'نقرة · نقر مزدوج · نقر بالزر الأيمن هنا',
    evtSingleClick: 'نقرة واحدة',
    evtDoubleClick: 'نقر مزدوج',
    evtRightClick:  'نقر بالزر الأيمن',

    // ── 12 Dynamic Buttons ──
    btnStartLoading: 'ابدأ التحميل',
    btnLoading:      'جارٍ التحميل…',
    btnDone:         'تم!',
    btnDisappear:    'اختفاء',
    btnReappear:     'ظهور',
    btnAddButton:    'إضافة زر',
    btnRemove:       '× إزالة ({id})',

    // ── 13 Mouse Hover ──
    hoverInfo:    'معلومات',
    hoverWarning: 'تحذير',
    hoverSuccess: 'نجاح',
    hoverDanger:  'خطر',
    tipInfo:      'تلميح: رسالة معلوماتية',
    tipWarning:   'تلميح: يحتاج شيء إلى انتباه',
    tipSuccess:   'تلميح: تمت العملية بنجاح',
    tipDanger:    'تلميح: إجراء مدمر',

    // ── 14 Focus / Blur ──
    focusUsername: 'اسم المستخدم',
    focusEmail:    'البريد الإلكتروني',
    focusComment:  'التعليق',
    phFocusField:  'انقر للتركيز على {field}',
    focusFields:   ['اسم المستخدم', 'البريد الإلكتروني', 'التعليق'],

    // ── 15 Drag & Drop ──
    dragAlpha:   'مهمة ألفا',
    dragBeta:    'مهمة بيتا',
    dragGamma:   'مهمة جاما',
    dragDelta:   'مهمة دلتا',
    dragEpsilon: 'مهمة إبسيلون',
    dragMoved:   'تم نقل "{label}" → الموضع {pos}',

    // ── 16 Browser Popups ──
    btnAlert:        'تنبيه',
    btnPrompt:       'مطالبة',
    btnConfirm:      'تأكيد',
    alertMsg:        'هذا تنبيه من المتصفح!',
    promptMsg:       'ما اسمك؟',
    confirmMsg:      'هل تؤكد هذا الإجراء؟',
    alertDismissed:  'تم إغلاق التنبيه',
    promptReturned:  'أعادت المطالبة: "{val}"',
    promptCancelled: 'تم إلغاء المطالبة',
    confirmOk:       'تم التأكيد: نقر موافق',
    confirmCancel:   'تم الإلغاء: نقر إلغاء',

    // ── 17 Links & Windows ──
    linkAnchor:      'مرساة (نفس الصفحة)',
    linkExternal:    'خارجي (تبويب جديد)',
    linkDownload:    'رابط تنزيل',
    btnJsNewTab:     'تبويب جديد بـ JS',
    btnJsNewWindow:  'نافذة جديدة بـ JS',
    newTabOpened:    'تم فتح تبويب جديد عبر JS',
    newWindowOpened: 'تم فتح نافذة جديدة عبر JS',

    // ── 18 iFrame ──
    iframeBadge:       'داخل الإطار',
    iframeTitle:       'منطقة محتوى الإطار',
    iframePlaceholder: 'اكتب داخل الإطار…',
    iframeBtnRead:     'قراءة',
    iframeResultInit:  'ستظهر النتيجة هنا',

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

    // ── 22 Popup Alerts ──
    btnWarningPopup:    'تحذير',
    btnErrorPopup:      'خطأ',
    btnExceptionPopup:  'استثناء',
    popupWarningTitle:   'تحذير',
    popupErrorTitle:     'خطأ',
    popupExceptionTitle: 'استثناء غير معالج',
    popupWarningMsg:     'قد يكون لهذا الإجراء عواقب غير مقصودة. يرجى مراجعة تغييراتك قبل المتابعة.',
    popupErrorMsg:       'حدث خطأ أثناء معالجة طلبك. تعذّر إتمام العملية.',
    popupExceptionMsg:   'TypeError: Cannot read properties of undefined\n  at PaginationTable (App.jsx:42:18)\n  at renderWithHooks (react-dom.js:14906)',
    btnDismiss: 'رفض',

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

    // ── Sidebar (new tab) ──
    navTestPetStore: 'متجر الحيوانات الأليفة',

    // ── Auth ──
    authLogin:           'تسجيل الدخول',
    authSignup:          'إنشاء حساب',
    authLogout:          'تسجيل الخروج',
    authAccount:         'الحساب',
    authForgotPassword:  'هل نسيت كلمة المرور؟',
    authEmail:           'البريد الإلكتروني',
    authPassword:        'كلمة المرور',
    authConfirmPassword: 'تأكيد كلمة المرور',
    authName:            'الاسم الكامل',
    authRememberMe:      'تذكرني',
    authTerms:           'أوافق على شروط الخدمة',
    authShowPassword:    'إظهار كلمة المرور',
    authHidePassword:    'إخفاء كلمة المرور',
    authNoAccount:       'مستخدم جديد؟',
    authHaveAccount:     'لديك حساب بالفعل؟',
    authForgotPrompt:    'أدخل بريدك الإلكتروني وسنرسل رابط إعادة التعيين.',
    authForgotConfirm:   'إذا كان هناك حساب بهذا البريد، فسنرسل رابط إعادة التعيين.',
    authErrInvalid:      'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    authErrEmailTaken:   'هذا البريد الإلكتروني مسجل بالفعل.',
    authErrMismatch:     'كلمتا المرور غير متطابقتين.',
    authErrShort:        'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
    authErrTerms:        'يجب أن توافق على الشروط.',
    authErrNetwork:      'خطأ في الشبكة. حاول مرة أخرى.',

    // ── Account ──
    accountWelcome:       'مرحبًا، {name}!',
    accountMemberSince:   'عضو منذ',
    accountGoToPetstore:  'الذهاب إلى متجر الحيوانات الأليفة',

    // ── Test Pet Store ──
    petstoreHeroTitle:    'متجر الحيوانات الأليفة',
    petstoreHeroSubtitle: 'أدر مجموعتك. يتم حفظ الحيوانات في MongoDB وربطها بحسابك.',
    petstoreHeroWelcome:  'مرحبًا، {name}',
    petstoreStatTotal:    'المجموع',
    petstoreStatAvailable:'متاح',
    petstoreStatPending:  'قيد الانتظار',
    petstoreStatSold:     'مباع',
    petstoreFilterAll:    'الكل',
    petStatusAvailable:   'متاح',
    petStatusPending:     'قيد الانتظار',
    petStatusSold:        'مباع',
    petAdd:               'إضافة حيوان',
    petEdit:              'تعديل الحيوان',
    petDelete:            'حذف الحيوان',
    petName:              'الاسم',
    petCategory:          'الفئة',
    petPhotoUrls:         'روابط الصور (رابط في كل سطر)',
    petTags:              'العلامات (مفصولة بفواصل)',
    petStatus:            'الحالة',
    petEmptyState:        'لا يوجد حيوانات بعد. أضف أول رفيق لك.',
    petConfirmDelete:     'حذف {name}؟',
    petSave:              'حفظ',
    petCancel:            'إلغاء',
    toastPetAdded:        'تمت إضافة الحيوان',
    toastPetUpdated:      'تم تحديث الحيوان',
    toastPetDeleted:      'تم حذف الحيوان',

    // ── Footer ──
    footerRights: 'جميع الحقوق محفوظة · غير مخصص للاستخدام التجاري',
    footerWit:    'findElement(By.Copyright, "violator") → NoSuchElementException',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? translations.en[key] ?? key
    if (typeof str !== 'string') return key
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str)
  }

  const tArr = key => translations[lang]?.[key] ?? translations.en[key] ?? []

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en')

  return (
    <LanguageContext.Provider value={{ lang, t, tArr, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
