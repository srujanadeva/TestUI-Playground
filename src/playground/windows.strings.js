// Text for the Playground sections in windows.jsx.
export default {
  en: {
    // ── Section titles ──
    sec16Title: 'Browser Popups',
    sec17Title: 'Links & New Windows',
    sec22Title: 'Popup Alerts',

    // ── Section descriptions ──
    sec16Desc: 'Native browser alert, prompt, and confirm dialogs.',
    sec17Desc: 'Anchor links, JS-opened tabs and windows.',
    sec22Desc: 'Trigger warning, error, and exception modal overlays.',

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
  },

  ar: {
    // ── Section titles ──
    sec16Title: 'النوافذ المنبثقة',
    sec17Title: 'الروابط والنوافذ الجديدة',
    sec22Title: 'تنبيهات منبثقة',

    // ── Section descriptions ──
    sec16Desc: 'مربعات حوار التنبيه والمطالبة والتأكيد الأصلية للمتصفح.',
    sec17Desc: 'روابط مرساة، تبويبات ونوافذ تُفتح عبر JavaScript.',
    sec22Desc: 'تشغيل تراكبات نمط التحذير والخطأ والاستثناء.',

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
  },
}
