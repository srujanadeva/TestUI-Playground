import { Router } from 'express'

// Serves the page shown inside the Frames page's cross-origin iframe (F6).
// It is served by the API (port 4000), so it has a different origin from the
// app (port 3000): the app can't read its DOM, and the two talk only via postMessage.
const router = Router()

const TEXT = {
  en: {
    badge: 'Cross-origin frame', title: 'Served from the API',
    placeholder: 'Type inside the frame…', read: 'Read', send: 'Send to page',
    result: 'Result will appear here', inbox: 'Messages from the page:', none: 'none yet',
  },
  ar: {
    badge: 'إطار من أصل مختلف', title: 'مقدَّم من الواجهة البرمجية',
    placeholder: 'اكتب داخل الإطار…', read: 'قراءة', send: 'إرسال إلى الصفحة',
    result: 'ستظهر النتيجة هنا', inbox: 'رسائل من الصفحة:', none: 'لا شيء بعد',
  },
}

// Only post back to an app running on this machine.
const ALLOWED_PARENT = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

router.get('/cross-origin', (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'en'
  const parent = typeof req.query.parent === 'string' && ALLOWED_PARENT.test(req.query.parent)
    ? req.query.parent : null
  const s = TEXT[lang]
  res.type('html').send(`<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,'Segoe UI',sans-serif}
  body{padding:16px;background:linear-gradient(135deg,#fef3c7,#fee2e2);display:flex;flex-direction:column;gap:10px}
  .badge{align-self:flex-start;background:#b45309;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em}
  h3{color:#b45309;font-size:14px}
  .origin{font-family:monospace;font-size:11px;color:#92400e}
  .row{display:flex;gap:8px}
  input{flex:1;min-width:0;padding:8px 12px;border:1px solid #fcd34d;border-radius:6px;font-size:14px;background:#fff}
  button{padding:8px 14px;background:#b45309;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}
  .result,.inbox{padding:10px 12px;background:#fff;border-radius:6px;color:#92400e;font-size:14px;border:1px solid #fcd34d;min-height:38px}
</style></head><body>
  <span class="badge">${s.badge}</span>
  <h3>${s.title}</h3>
  <div class="origin" id="xo-origin"></div>
  <div class="row">
    <input id="xo-input" type="text" placeholder="${s.placeholder}"/>
    <button id="xo-btn">${s.read}</button>
    <button id="xo-send">${s.send}</button>
  </div>
  <div id="xo-result" class="result">${s.result}</div>
  <div class="inbox">${s.inbox} <span id="xo-inbox">${s.none}</span></div>
<script>
  var parentOrigin = ${JSON.stringify(parent)};
  var input = document.getElementById('xo-input');
  document.getElementById('xo-origin').textContent = location.origin;
  document.getElementById('xo-btn').onclick = function () {
    document.getElementById('xo-result').textContent = 'Value: ' + input.value;
  };
  function post(msg) { if (parentOrigin) window.parent.postMessage(msg, parentOrigin); }
  document.getElementById('xo-send').onclick = function () { post({ type: 'tp-xo-message', text: input.value }); };
  window.addEventListener('message', function (e) {
    if (e.origin !== parentOrigin || !e.data || e.data.type !== 'tp-xo-to-frame') return;
    document.getElementById('xo-inbox').textContent = String(e.data.text);
  });
  post({ type: 'tp-xo-ready', origin: location.origin });
</script>
</body></html>`)
})

export default router
