// Text for the Playground sections in buttons.jsx.
export default {
  en: {
    // ── Section titles ──
    sec10Title: 'Button Click Counter',
    sec11Title: 'Double Click',
    sec12Title: 'Dynamic Buttons',

    // ── Section descriptions ──
    sec10Desc: 'Each coloured button counts its own clicks, and Total adds them up. Reset sets everything back to 0.',
    sec11Desc: 'Click, double-click or right-click inside the box. Each action is listed below it, newest first.',
    sec12Desc: 'Buttons that change while you use them: one loads for 2 seconds, one swaps with another, and Add Button creates new ones.',

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

    // ── Reset / clear buttons ──
    btnClearLog: 'Clear log',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip10Steps: [
      'Click Primary, Success and Danger a few times each.',
      'Watch each count and the Total change.',
      'Press Reset to start again.',
    ],
    tip10Check: 'the numbers in [data-stat="primary"], [data-stat="success"], [data-stat="danger"] and [data-stat="total"]. The coloured buttons have no id, so find them by class name.',
    tip11Steps: [
      'Click once: "single click" is logged.',
      'Double-click: you get two single clicks and then a double click, because that is how browsers fire them.',
      'Right-click: it is logged instead of opening the browser menu. Clear log empties the list.',
    ],
    tip11Check: 'the entries in #click-log and their data-event, using your tool\'s double-click and right-click actions rather than two quick clicks.',
    tip12Steps: [
      'Press Start Loading: it is disabled for 2 seconds, then shows Done!.',
      'Press Disappear: Reappear takes its place.',
      'Press Add Button a few times, and click a new button to remove it. Reset puts everything back.',
    ],
    tip12Check: 'waiting for #btn-load to be enabled again rather than sleeping, and finding added buttons by [data-dynamic-id], whose values change on every run.',
  },

  ar: {
    // ── Section titles ──
    sec10Title: 'عداد نقرات الزر',
    sec11Title: 'النقر المزدوج',
    sec12Title: 'الأزرار الديناميكية',

    // ── Section descriptions ──
    sec10Desc: 'كل زر ملوّن يعدّ نقراته، والمجموع يجمعها. «إعادة تعيين» يعيد كل شيء إلى 0.',
    sec11Desc: 'انقر أو انقر نقرًا مزدوجًا أو انقر بالزر الأيمن داخل المربع. يُسجَّل كل إجراء تحته، الأحدث أولاً.',
    sec12Desc: 'أزرار تتغيّر أثناء استخدامها: واحد يُحمِّل لمدة ثانيتين، وآخر يتبادل مع زر آخر، و«إضافة زر» ينشئ أزرارًا جديدة.',

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

    // ── Reset / clear buttons ──
    btnClearLog: 'مسح السجل',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip10Steps: [
      'انقر على «أساسي» و«نجاح» و«خطر» عدة مرات.',
      'راقب كل عدد والمجموع يتغيّران.',
      'اضغط «إعادة تعيين» للبدء من جديد.',
    ],
    tip10Check: 'الأرقام في [data-stat="primary"] و [data-stat="success"] و [data-stat="danger"] و [data-stat="total"]. لا تملك الأزرار الملوّنة معرّفًا، لذا ابحث عنها باسم الصنف.',
    tip11Steps: [
      'انقر مرة واحدة: تُسجَّل «نقرة واحدة».',
      'انقر نقرًا مزدوجًا: تظهر نقرتان مفردتان ثم نقر مزدوج، لأن المتصفح يطلقها هكذا.',
      'انقر بالزر الأيمن: يُسجَّل بدلاً من فتح قائمة المتصفح. «مسح السجل» يفرغ القائمة.',
    ],
    tip11Check: 'الإدخالات في #click-log وقيمة data-event لكل منها، باستخدام أوامر النقر المزدوج والنقر الأيمن في أداة الاختبار بدلاً من نقرتين سريعتين.',
    tip12Steps: [
      'اضغط «ابدأ التحميل»: يُعطَّل لمدة ثانيتين ثم يعرض «تم!».',
      'اضغط «اختفاء»: يحل محله «ظهور».',
      'اضغط «إضافة زر» عدة مرات، وانقر على زر جديد لإزالته. «إعادة تعيين» يعيد كل شيء كما كان.',
    ],
    tip12Check: 'انتظار عودة #btn-load إلى التفعيل بدلاً من الانتظار الثابت، والبحث عن الأزرار المضافة عبر [data-dynamic-id] التي تتغيّر قيمها في كل تشغيل.',
  },
}
