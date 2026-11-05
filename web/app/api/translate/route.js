import { translate } from '../../../lib/argos';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request) {
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 40000) return Response.json({ error: 'النص أطول من الحد المسموح.' }, { status: 413 });
    body = JSON.parse(raw);
  } catch { return Response.json({ error: 'الطلب غير صالح.' }, { status: 400 }); }
  const { text, source, target } = body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > 5000 || !(source === 'en' && target === 'ar')) {
    return Response.json({ error: 'أدخل نصاً إنكليزياً لا يتجاوز ٥٠٠٠ حرف للترجمة إلى العربية.' }, { status: 400 });
  }
  try { return Response.json({ translation: await translate(text.trim(), source, target) }); }
  catch { return Response.json({ error: 'تعذرت الترجمة حالياً. حاول مرة ثانية.' }, { status: 503 }); }
}
