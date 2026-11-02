// Text for the Playground sections in events.jsx.
export default {
  en: {
    // ── Section titles ──
    sec13Title: 'Mouse Hover',
    sec14Title: 'Focus / Blur',
    sec15Title: 'Drag & Drop',

    // ── Section descriptions ──
    sec13Desc: 'Hover over a card to reveal its tooltip.',
    sec14Desc: 'Tab through fields — focus and blur events are captured.',
    sec15Desc: 'Drag items to reorder the list.',

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

    // ── 28 Signature Pad ──
    sec28Title:           'Signature Pad',
    sec28Desc:            'Draw on the canvas with mouse down, move and up (touch and pen work too). A canvas has no DOM text, so assert data-empty and data-strokes. Save rejects a signature that is too short, such as a single click.',
    signatureAria:        'Signature',
    signaturePlaceholder: 'Sign here',
    signatureUndo:        'Undo',
    signatureClear:       'Clear',
    signatureSave:        'Save',
    signatureTooShort:    'Signature is too short. Draw your full signature.',
    signatureSaved:       'Saved as PNG ({kb} KB). Stroke count: {n}',
    navSignature:         'Signature Pad',
  },

  ar: {
    // ── Section titles ──
    sec13Title: 'تمرير الماوس',
    sec14Title: 'التركيز / فقدان التركيز',
    sec15Title: 'السحب والإفلات',

    // ── Section descriptions ──
    sec13Desc: 'مرر الماوس فوق بطاقة لإظهار تلميحها.',
    sec14Desc: 'تنقل بين الحقول — يتم التقاط أحداث التركيز وفقدانه.',
    sec15Desc: 'اسحب العناصر لإعادة ترتيب القائمة.',

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

    // ── 28 Signature Pad ──
    sec28Title:           'لوحة التوقيع',
    sec28Desc:            'ارسم على اللوحة بالضغط والتحريك والإفلات (يعمل اللمس والقلم أيضًا). لا تحتوي اللوحة على نص في DOM، لذا تحقق من data-empty و data-strokes. يرفض الحفظ التوقيع القصير جدًا، مثل نقرة واحدة.',
    signatureAria:        'التوقيع',
    signaturePlaceholder: 'وقّع هنا',
    signatureUndo:        'تراجع',
    signatureClear:       'مسح',
    signatureSave:        'حفظ',
    signatureTooShort:    'التوقيع قصير جدًا. ارسم توقيعك كاملًا.',
    signatureSaved:       'تم الحفظ بصيغة PNG ({kb} كيلوبايت). عدد الخطوط: {n}',
    navSignature:         'لوحة التوقيع',
  },
}
