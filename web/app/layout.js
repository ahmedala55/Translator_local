import './globals.css';
import localFont from 'next/font/local';

const thmanyah = localFont({
  src: './fonts/thmanyahsans-Bold.woff2',
  variable: '--font-thmanyah',
  weight: '700',
  display: 'swap',
});
const arsenica = localFont({
  src: './fonts/Arsenica-Arabic-Antiqua-Demibold.ttf',
  variable: '--font-arsenica',
  weight: '600',
  display: 'swap',
});
export const metadata = { title: 'الوافي | ترجمة أقرب إليك', description: 'ترجمة محلية من الإنكليزية إلى العربية بمحرك Argos' };
export default function RootLayout({ children }) { return <html lang="ar" dir="rtl" className={`${thmanyah.variable} ${arsenica.variable}`}><body>{children}</body></html>; }
