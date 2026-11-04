// Text for the Playground sections in inputs.jsx.
export default {
  en: {
    // ── Section titles ──
    sec01Title: 'Text Input',
    sec02Title: 'Password & Textarea',
    sec03Title: 'Date Picker',
    sec04Title: 'Range Slider',
    sec05Title: 'File Upload',
    sec06Title: 'Form Validation',

    // ── Section descriptions ──
    sec01Desc: 'Type a name, then press Greet to see a greeting appear below.',
    sec02Desc: 'Type a password and use Show / Hide to reveal it. Type notes below to see a live character count.',
    sec03Desc: 'Pick a single date, or a From and a To date for a range. The chosen values appear below.',
    sec04Desc: 'Drag a slider, or click it and use the arrow keys. The number next to its label follows it.',
    sec05Desc: 'Click the zone to choose files, or drag files onto it. Their names and sizes are listed; nothing is uploaded.',
    sec06Desc: 'Fill in email, phone and password, then press Submit. Any field that is wrong shows a message under it.',

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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip01Steps: [
      'Type your name in the box.',
      'Press Greet.',
      'Press Greet with the box empty: it greets "stranger".',
    ],
    tip01Check: 'the greeting in #greeting-output contains the typed name.',
    tip02Steps: [
      'Type a password; it shows as dots.',
      'Press Show: the field becomes plain text. Press Hide to mask it again.',
      'Type in the notes box and watch the count update.',
    ],
    tip02Check: 'the password field\'s type attribute switches between "password" and "text", and #textarea-char-count shows the right length.',
    tip03Steps: [
      'Pick a date from the calendar, or type it.',
      'Fill in both From and To.',
      'The range line appears only once both are set.',
    ],
    tip03Check: 'the input value is in YYYY-MM-DD form whatever format the browser displays, and #date-range-output appears only when both dates are set.',
    tip04Steps: [
      'Drag the Quantity slider and watch the number change.',
      'Click a slider, then press the arrow keys to move it one step at a time.',
      'Move Brightness and watch the preview box fade.',
    ],
    tip04Check: 'the slider\'s value, or the number in its label. Dragging by pixels is fragile, so tests usually set the value or press arrow keys.',
    tip05Steps: [
      'Click the zone and choose one or more files.',
      'Or drag files from your desktop onto the zone.',
      'Choosing again replaces the list.',
    ],
    tip05Check: 'one .file-item per file with the right data-filename. Tests set files on the hidden #file-upload-input directly instead of using the system dialog.',
    tip06Steps: [
      'Press Submit with everything empty to see all three errors.',
      'Fix them one at a time: an email with "@", a 10-digit phone, a password of 8+ characters.',
      'Press Submit again to see the success message.',
    ],
    tip06Check: 'each error (#email-error, #phone-error, #password-error) appears and goes away as expected, and then #form-success.',
  },

  ar: {
    // ── Section titles ──
    sec01Title: 'إدخال النص',
    sec02Title: 'كلمة المرور ومنطقة النص',
    sec03Title: 'منتقي التاريخ',
    sec04Title: 'شريط التمرير',
    sec05Title: 'رفع الملف',
    sec06Title: 'التحقق من النموذج',

    // ── Section descriptions ──
    sec01Desc: 'اكتب اسمًا ثم اضغط «ترحيب» لتظهر رسالة ترحيب في الأسفل.',
    sec02Desc: 'اكتب كلمة مرور واستخدم «إظهار» / «إخفاء» لكشفها. اكتب ملاحظات في الأسفل لترى عدد الأحرف يتحدّث مباشرة.',
    sec03Desc: 'اختر تاريخًا واحدًا، أو تاريخَي «من» و«إلى» لنطاق. تظهر القيم المختارة في الأسفل.',
    sec04Desc: 'اسحب شريط التمرير، أو انقر عليه واستخدم مفاتيح الأسهم. يتبعه الرقم بجانب عنوانه.',
    sec05Desc: 'انقر على المنطقة لاختيار ملفات، أو اسحب الملفات إليها. تُعرض أسماؤها وأحجامها؛ ولا يُرفع شيء.',
    sec06Desc: 'املأ البريد الإلكتروني والهاتف وكلمة المرور ثم اضغط «إرسال». كل حقل غير صحيح تظهر تحته رسالة.',

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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip01Steps: [
      'اكتب اسمك في المربع.',
      'اضغط «ترحيب».',
      'اضغط «ترحيب» والمربع فارغ: تظهر تحية لـ "stranger".',
    ],
    tip01Check: 'أن رسالة الترحيب في #greeting-output تحتوي على الاسم المكتوب.',
    tip02Steps: [
      'اكتب كلمة مرور؛ تظهر كنقاط.',
      'اضغط «إظهار»: يصبح الحقل نصًا عاديًا. اضغط «إخفاء» لإخفائها من جديد.',
      'اكتب في مربع الملاحظات وراقب العدد يتغيّر.',
    ],
    tip02Check: 'أن خاصية type لحقل كلمة المرور تتبدّل بين "password" و "text"، وأن #textarea-char-count يعرض الطول الصحيح.',
    tip03Steps: [
      'اختر تاريخًا من التقويم أو اكتبه.',
      'املأ حقلَي «من» و«إلى».',
      'يظهر سطر النطاق فقط بعد تعيين التاريخين.',
    ],
    tip03Check: 'أن قيمة الحقل بصيغة YYYY-MM-DD أيًّا كانت الصيغة التي يعرضها المتصفح، وأن #date-range-output لا يظهر إلا بعد تعيين التاريخين.',
    tip04Steps: [
      'اسحب شريط «الكمية» وراقب الرقم يتغيّر.',
      'انقر على شريط ثم اضغط مفاتيح الأسهم لتحريكه خطوة واحدة في كل مرة.',
      'حرّك «السطوع» وراقب مربع المعاينة يخفت.',
    ],
    tip04Check: 'قيمة شريط التمرير أو الرقم في عنوانه. السحب بالبكسل غير موثوق، لذا تضبط الاختبارات القيمة عادةً أو تضغط مفاتيح الأسهم.',
    tip05Steps: [
      'انقر على المنطقة واختر ملفًا أو أكثر.',
      'أو اسحب ملفات من سطح المكتب إلى المنطقة.',
      'الاختيار من جديد يستبدل القائمة.',
    ],
    tip05Check: 'وجود عنصر .file-item لكل ملف بقيمة data-filename الصحيحة. تضع الاختبارات الملفات في #file-upload-input المخفي مباشرةً بدلاً من نافذة النظام.',
    tip06Steps: [
      'اضغط «إرسال» والحقول فارغة لترى الأخطاء الثلاثة.',
      'صحّحها واحدًا تلو الآخر: بريد يحتوي على "@"، وهاتف من 10 أرقام، وكلمة مرور من 8 أحرف أو أكثر.',
      'اضغط «إرسال» مرة أخرى لترى رسالة النجاح.',
    ],
    tip06Check: 'أن كل خطأ (#email-error و #phone-error و #password-error) يظهر ويختفي كما هو متوقع، ثم يظهر #form-success.',
  },
}
