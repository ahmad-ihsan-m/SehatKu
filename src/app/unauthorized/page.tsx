import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
      <p className="text-slate-600 mb-8 text-center max-w-md">
        Anda tidak memiliki izin (role) yang diperlukan untuk mengakses halaman ini.
      </p>
      <Link href="/dashboard">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  )
}
