import type { Metadata } from 'next'
import { Providers } from './providers'
import { ToastContainer } from 'react-toastify'
import '@/styles/globals.css'
import '@/styles/sweetalert2.css'
import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: 'GameCloud - Game Library Manager',
  description: 'Manage your game collection with torrent integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  )
}
