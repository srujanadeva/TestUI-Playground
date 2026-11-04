// Text for the Playground sections in events.jsx.
export default {
  en: {
    // ── Section titles ──
    sec13Title: 'Mouse Hover',
    sec14Title: 'Focus / Blur',
    sec15Title: 'Drag & Drop',

    // ── Section descriptions ──
    sec13Desc: 'Move the mouse over a card to show its tooltip. The tooltip is removed when the mouse leaves.',
    sec14Desc: 'Click into a field, or press Tab to move between fields. Every time you enter a field (focus) or leave it (blur) is listed below. "Blur" is the browser\'s word for leaving a field; nothing turns blurry.',
    sec15Desc: 'Drag an item by its handle and drop it on another item to move it there. The numbers show the new order.',

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
    focusLogEntered: '{field} → entered (focus)',
    focusLogLeft:    '{field} → left (blur)',
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
    sec28Desc:            'Draw a signature with the mouse, a finger or a pen, then press Save to see it as an image.',
    signatureAria:        'Signature',
    signaturePlaceholder: 'Sign here',
    signatureUndo:        'Undo',
    signatureClear:       'Clear',
    signatureSave:        'Save',
    signatureTooShort:    'Signature is too short. Draw your full signature.',
    signatureSaved:       'Saved as PNG ({kb} KB). Stroke count: {n}',
    navSignature:         'Signature Pad',

    // ── Reset / clear buttons ──
    btnResetOrder: 'Reset order',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip13Steps: [
      'Hover over each card.',
      'Move away: the tooltip is removed from the page, not just hidden.',
    ],
    tip13Check: 'that [data-testid="hover-info-tooltip"] exists only while hovering; at other times it is not in the page at all.',
    tip14Steps: [
      'Click the first field, then press Tab twice.',
      'Watch the log: each Tab adds "left (blur)" for the field you left and "entered (focus)" for the next one.',
      'Click outside the fields: you get one last "left (blur)" and no field stays highlighted.',
      'Clear log empties the list.',
    ],
    tip14Check: 'the data-field and data-event of each entry in #focus-event-log, and the input-focused class on the active field. Many real forms validate or save on blur, so a test must leave the field (Tab or click elsewhere), not just type.',
    tip15Steps: [
      'Drag the first item onto the third.',
      'The other items shift and the numbers update.',
      'Reset order puts the list back.',
    ],
    tip15Check: 'the data-drag-pos of each [data-drag-id] item. Some tools\' built-in drag doesn\'t fire HTML5 drag events; if nothing moves, fire dragstart and drop yourself.',
    tip28Steps: [
      'Draw inside the box.',
      'Undo removes the last stroke; Clear removes everything.',
      'Save shows a preview. A single click is too short and is rejected.',
    ],
    tip28Check: 'data-empty and data-strokes on the canvas, because a canvas has no text inside it to read.',
  },

  ar: {
    // ── Section titles ──
    sec13Title: 'تمرير الماوس',
    sec14Title: 'التركيز / فقدان التركيز',
    sec15Title: 'السحب والإفلات',

    // ── Section descriptions ──
    sec13Desc: 'حرّك الماوس فوق بطاقة لإظهار تلميحها. يُزال التلميح عند ابتعاد الماوس.',
    sec14Desc: 'انقر داخل حقل، أو اضغط Tab للتنقل بين الحقول. يُسجَّل في الأسفل كل دخول إلى حقل (focus) وكل خروج منه (blur). كلمة "blur" هي اسم المتصفح للخروج من الحقل، ولا يصبح أي شيء ضبابيًا.',
    sec15Desc: 'اسحب عنصرًا من مقبضه وأفلته على عنصر آخر لنقله إلى مكانه. تعرض الأرقام الترتيب الجديد.',

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
    focusLogEntered: '{field} ← دخول (focus)',
    focusLogLeft:    '{field} ← خروج (blur)',
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
    sec28Desc:            'ارسم توقيعًا بالماوس أو بإصبعك أو بالقلم، ثم اضغط «حفظ» لتراه صورة.',
    signatureAria:        'التوقيع',
    signaturePlaceholder: 'وقّع هنا',
    signatureUndo:        'تراجع',
    signatureClear:       'مسح',
    signatureSave:        'حفظ',
    signatureTooShort:    'التوقيع قصير جدًا. ارسم توقيعك كاملًا.',
    signatureSaved:       'تم الحفظ بصيغة PNG ({kb} كيلوبايت). عدد الخطوط: {n}',
    navSignature:         'لوحة التوقيع',

    // ── Reset / clear buttons ──
    btnResetOrder: 'إعادة الترتيب',

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip13Steps: [
      'مرّر الماوس فوق كل بطاقة.',
      'ابتعد عنها: يُزال التلميح من الصفحة ولا يُخفى فقط.',
    ],
    tip13Check: 'أن [data-testid="hover-info-tooltip"] موجود فقط أثناء التمرير؛ ولا وجود له في الصفحة في غير ذلك.',
    tip14Steps: [
      'انقر على الحقل الأول ثم اضغط Tab مرتين.',
      'راقب السجل: كل ضغطة Tab تضيف «خروج (blur)» للحقل الذي غادرته و«دخول (focus)» للحقل التالي.',
      'انقر خارج الحقول: يظهر «خروج (blur)» أخير ولا يبقى أي حقل مميزًا.',
      '«مسح السجل» يفرغ القائمة.',
    ],
    tip14Check: 'قيمتا data-field و data-event لكل إدخال في #focus-event-log، والصنف input-focused على الحقل النشط. كثير من النماذج الحقيقية تتحقق أو تحفظ عند blur، لذا يجب أن يغادر الاختبار الحقل (بالضغط على Tab أو النقر في مكان آخر) لا أن يكتب فقط.',
    tip15Steps: [
      'اسحب العنصر الأول وأفلته على الثالث.',
      'تتحرك العناصر الأخرى وتتحدّث الأرقام.',
      '«إعادة الترتيب» يعيد القائمة كما كانت.',
    ],
    tip15Check: 'قيمة data-drag-pos لكل عنصر [data-drag-id]. في بعض الأدوات لا يطلق السحب المدمج أحداث السحب في HTML5؛ إن لم يتحرك شيء فأطلق dragstart و drop بنفسك.',
    tip28Steps: [
      'ارسم داخل المربع.',
      '«تراجع» يزيل آخر خط؛ و«مسح» يزيل كل شيء.',
      '«حفظ» يعرض معاينة. النقرة الواحدة قصيرة جدًا وتُرفض.',
    ],
    tip28Check: 'قيمتا data-empty و data-strokes على اللوحة، لأن اللوحة لا تحتوي على نص يمكن قراءته.',
  },
}
