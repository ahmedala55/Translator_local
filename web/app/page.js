'use client';
import { useRef, useState } from 'react';

export default function Home() {
  const source = 'en';
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const version = useRef(0);
  const target = 'ar';
  const name = code => code === 'ar' ? 'العربية' : 'الإنكليزية';
  function edit(value) { version.current++; setText(value); setOutput(''); setError(''); setCopied(false); }
  async function run() {
    if (!text.trim() || busy) return;
    const current = version.current;
    setBusy(true); setError(''); setCopied(false);
    try {
      const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, source, target }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version.current === current) setOutput(data.translation);
    } catch (e) { if (version.current === current) setError(e.message || 'تعذر الاتصال بالمحرك.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setCopied(true); }
    catch { setError('تعذر النسخ. يمكنك تحديد النص ونسخه يدوياً.'); }
  }
  return <main>
    <header><a className="brand" href="/" aria-label="الوافي الرئيسية"><span className="brand-icon">و</span><span>الوافي<span className="brand-sub">ALWAFI TRANSLATE</span></span></a><span className="local"><i /> ترجمة بمحرك Argos</span></header>
    <section className="intro"><span className="eyebrow">من لغة إلى لغة، بكل بساطة</span><h1>كلماتك، <em>بمعنى أوضح.</em></h1><p>مساحة بسيطة للترجمة من الإنكليزية إلى العربية.</p></section>
    <section className="translator" aria-label="مترجم النصوص">
      <div className="language-bar"><div><span className="lang-dot">{source === 'en' ? 'EN' : 'ع'}</span>{name(source)}<small>لغة النص</small></div><span className="direction-arrow" aria-hidden="true">←</span><div><span className="lang-dot">{target === 'en' ? 'EN' : 'ع'}</span>{name(target)}<small>الترجمة إلى</small></div></div>
      <div className="panels"><div className="panel input-panel"><label className="sr-only" htmlFor="source-text">النص المراد ترجمته</label><textarea id="source-text" dir={source === 'ar' ? 'rtl' : 'ltr'} lang={source} value={text} maxLength={5000} placeholder={source === 'en' ? 'Type or paste your text here…' : 'اكتب أو الصق النص هنا…'} onChange={e => edit(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } }} /><div className="panel-bottom"><span>{text.length.toLocaleString('ar-IQ')} / ٥٬٠٠٠ حرف</span><button className="text-button" onClick={() => edit('')} disabled={!text} aria-label="مسح النص">مسح النص ×</button></div></div>
      <div className="panel output-panel"><div className={`result ${!output ? 'empty' : ''}`} dir={output ? (target === 'ar' ? 'rtl' : 'ltr') : 'rtl'} lang={target} aria-live="polite" aria-busy={busy}>{busy ? <span className="working"><span className="spinner" /> جارٍ ترجمة كلماتك…</span> : output || <div className="placeholder"><span>文</span><p>هنا تظهر ترجمتك</p><small>كل كلمة تفتح باباً جديداً</small></div>}</div><div className="panel-bottom"><span>{output && !busy ? 'اكتملت الترجمة' : 'الإنكليزية إلى العربية'}</span><button className="text-button" onClick={copy} disabled={!output || busy}>{copied ? 'تم النسخ ✓' : 'نسخ الترجمة ⧉'}</button></div></div></div>
      <div className="action-bar"><span className="shortcut">اختصار الترجمة <kbd>Ctrl</kbd> + <kbd>Enter</kbd></span><button className="translate-button" onClick={run} disabled={!text.trim() || busy}>{busy ? 'جارٍ الترجمة…' : 'ترجم النص'}<span>←</span></button></div>
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="notes"><span><b>◈</b> لا نضيف سجلاً للنصوص</span><span><b>←</b> من الإنكليزية إلى العربية</span><span><b>✓</b> مصمم لترجمة النصوص</span></div>
    <footer><span>الوافي<span className="footer-separator">/</span>لغة تقرّب المسافات</span><span>بمحرك <a href="https://github.com/argosopentech/argos-translate" target="_blank" rel="noreferrer">Argos Translate ↗</a></span></footer>
  </main>;
}
