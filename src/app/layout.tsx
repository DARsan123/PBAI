import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/shell';
export const metadata:Metadata={title:'PrecisionBridge AI | Supervised care, connected research',description:'A synthetic, clinician-supervised personalized medicine demonstration. Not for clinical use.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>;}
