// Text for the Playground sections in windows.jsx.
export default {
  en: {
    // ── Section titles ──
    sec16Title: 'Browser Popups',
    sec17Title: 'Links & New Windows',
    sec22Title: 'Popup Alerts',

    // ── Section descriptions ──
    sec16Desc: 'Open the browser\'s own alert, prompt and confirm dialogs. The line below shows what each one returned.',
    sec17Desc: 'Links and buttons that jump within the page, open new tabs or windows, or download a file.',
    sec22Desc: 'Buttons that open pop-up boxes drawn by the page itself, unlike the browser dialogs in section 16.',

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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip16Steps: [
      'Press Alert, then OK.',
      'Press Prompt, type something, then OK; try Cancel too.',
      'Press Confirm and try both OK and Cancel.',
    ],
    tip16Check: 'the text of #popup-result. The dialog blocks the page, so the test must be ready to accept or dismiss it before clicking the button.',
    tip17Steps: [
      'The anchor link scrolls back up to section 01.',
      'The new-tab link and the two JS buttons open example.com in a new tab or a small window.',
      'The download link saves sample.txt.',
    ],
    tip17Check: 'switching to the new tab or window by its handle and back again, and that the download link has the download attribute.',
    tip22Steps: [
      'Press each button to open its pop-up.',
      'Close it with ✕, Dismiss, or a click on the dark area around it.',
    ],
    tip22Check: 'that [role="dialog"] appears with the right #popup-title and is gone after closing. These are ordinary page elements, so no dialog handler is needed.',

    // ── 29 Snackbar ──
    sec29Title:       'Snackbar',
    sec29Desc:        'Short messages that pop up in the bottom corner of the screen and go away on their own, except errors. Each one stays for a different, random time.',
    btnSnackInfo:     'Save settings',
    btnSnackDelete:   'Delete item',
    btnSnackError:    'Show error',
    btnSnackBurst:    'Show 3 at once',
    snackSaved:       'Settings saved',
    snackItemDeleted: 'Item deleted',
    snackError:       'Could not connect. Check your network and try again.',
    snackBurst1:      'Message 1 of 3',
    snackBurst2:      'Message 2 of 3',
    snackBurst3:      'Message 3 of 3',
    snackUndo:        'Undo',
    snackClose:       'Close message',
    snackItems:       'Items left: {n}',
    snackLogTimedOut: '"{msg}" closed by itself (timed out)',
    snackLogClosed:   '"{msg}" closed with ✕',
    snackLogUndone:   '"{msg}" undone; the item is back',
    tip29Steps: [
      'Press Save settings and watch the message in the bottom corner: it closes by itself after 3–7 seconds, a different time each time.',
      'Press Delete item, then Undo before the message goes: the count comes back. Show error stays until you press ✕.',
      'Press Show 3 at once to stack several. Reset clears them and puts the items back.',
    ],
    tip29Check: 'that [data-testid="snackbar"] appears with the right text, then waiting for it to disappear rather than sleeping: its data-duration-ms is random. #snackbar-log says whether it timed out, was closed or was undone. Snackbars float over the page and can cover buttons near the bottom.',
  },

  ar: {
    // ── Section titles ──
    sec16Title: 'النوافذ المنبثقة',
    sec17Title: 'الروابط والنوافذ الجديدة',
    sec22Title: 'تنبيهات منبثقة',

    // ── Section descriptions ──
    sec16Desc: 'افتح مربعات الحوار الخاصة بالمتصفح: التنبيه والمطالبة والتأكيد. يعرض السطر في الأسفل ما أعاده كل منها.',
    sec17Desc: 'روابط وأزرار تنتقل داخل الصفحة، أو تفتح تبويبات ونوافذ جديدة، أو تنزّل ملفًا.',
    sec22Desc: 'أزرار تفتح نوافذ منبثقة ترسمها الصفحة نفسها، على عكس مربعات حوار المتصفح في القسم 16.',

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

    // ── "Try this" tips (the ⓘ in each header; see SectionHeader) ──
    tip16Steps: [
      'اضغط «تنبيه» ثم «موافق».',
      'اضغط «مطالبة» واكتب شيئًا ثم «موافق»؛ وجرّب «إلغاء» أيضًا.',
      'اضغط «تأكيد» وجرّب «موافق» و«إلغاء».',
    ],
    tip16Check: 'نص #popup-result. يوقف مربع الحوار الصفحة، لذا يجب أن يكون الاختبار مستعدًا لقبوله أو رفضه قبل النقر على الزر.',
    tip17Steps: [
      'رابط المرساة يعيدك إلى القسم 01.',
      'رابط التبويب الجديد وزرّا JavaScript تفتح example.com في تبويب جديد أو نافذة صغيرة.',
      'رابط التنزيل يحفظ الملف sample.txt.',
    ],
    tip17Check: 'التبديل إلى التبويب أو النافذة الجديدة عبر معرّفها ثم العودة، وأن رابط التنزيل يحمل الخاصية download.',
    tip22Steps: [
      'اضغط كل زر لفتح نافذته المنبثقة.',
      'أغلقها بـ ✕ أو «رفض» أو بالنقر على المنطقة الداكنة حولها.',
    ],
    tip22Check: 'أن [role="dialog"] يظهر مع #popup-title الصحيح ويختفي بعد الإغلاق. هذه عناصر عادية في الصفحة، فلا حاجة إلى معالج لمربعات الحوار.',

    // ── 29 Snackbar ──
    sec29Title:       'شريط الإشعارات',
    sec29Desc:        'رسائل قصيرة تظهر في الزاوية السفلية من الشاشة وتختفي من تلقاء نفسها، باستثناء رسائل الخطأ. تبقى كل رسالة مدة مختلفة وعشوائية.',
    btnSnackInfo:     'حفظ الإعدادات',
    btnSnackDelete:   'حذف عنصر',
    btnSnackError:    'عرض خطأ',
    btnSnackBurst:    'عرض 3 معًا',
    snackSaved:       'تم حفظ الإعدادات',
    snackItemDeleted: 'تم حذف العنصر',
    snackError:       'تعذّر الاتصال. تحقق من الشبكة وحاول مرة أخرى.',
    snackBurst1:      'الرسالة 1 من 3',
    snackBurst2:      'الرسالة 2 من 3',
    snackBurst3:      'الرسالة 3 من 3',
    snackUndo:        'تراجع',
    snackClose:       'إغلاق الرسالة',
    snackItems:       'العناصر المتبقية: {n}',
    snackLogTimedOut: '"{msg}" أُغلقت من تلقاء نفسها (انتهت مدتها)',
    snackLogClosed:   '"{msg}" أُغلقت بـ ✕',
    snackLogUndone:   '"{msg}" تم التراجع عنها؛ عاد العنصر',
    tip29Steps: [
      'اضغط «حفظ الإعدادات» وراقب الرسالة في الزاوية السفلية: تُغلق من تلقاء نفسها بعد 3–7 ثوانٍ، ومدة مختلفة في كل مرة.',
      'اضغط «حذف عنصر» ثم «تراجع» قبل أن تختفي الرسالة: يعود العدد. أما «عرض خطأ» فتبقى حتى تضغط ✕.',
      'اضغط «عرض 3 معًا» لتظهر عدة رسائل فوق بعضها. «إعادة تعيين» يمسحها ويعيد العناصر.',
    ],
    tip29Check: 'أن [data-testid="snackbar"] يظهر بالنص الصحيح، ثم انتظار اختفائه بدلاً من الانتظار الثابت: قيمة data-duration-ms عشوائية. يوضح #snackbar-log هل انتهت مدتها أم أُغلقت أم تم التراجع عنها. تطفو الرسائل فوق الصفحة وقد تغطي الأزرار القريبة من الأسفل.',
  },
}
