import { Kanit, Sarabun } from 'next/font/google'
import './globals.css'


const kanit = Kanit({ subsets: ['thai'], weight: ['400', '600', '700', '800'], variable: '--font-kanit' })
const sarabun = Sarabun({ subsets: ['thai'], weight: ['400', '500', '600'], variable: '--font-sarabun' })

export const metadata = {
  title: 'ท้าหรือทำ',
  description: 'เปิดไพ่ใบแรก แล้วเริ่มเกมกันเลย',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} ${kanit.variable}`}>
        <div className="grain"></div>
        {children}
      </body>
    </html>
  )
}