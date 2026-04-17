import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IBAN Validator Pro',
  description: 'Validate IBANs and get structured bank details in one call',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
