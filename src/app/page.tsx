import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Shield, Clock, Pill } from 'lucide-react'

const features = [
  {
    icon: Pill,
    title: 'Katalog Lengkap',
    desc: 'Ribuan obat dengan harga terjangkau dan terjamin kualitasnya.',
  },
  {
    icon: Shield,
    title: 'Aman & Terpercaya',
    desc: 'Seluruh transaksi aman dengan sistem perlindungan data terbaik.',
  },
  {
    icon: Clock,
    title: 'Layanan 24 Jam',
    desc: 'Pesan kapan saja, tim apoteker siap melayani kebutuhan Anda.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-bold text-foreground">SehatKu</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Daftar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
          <Heart className="w-3 h-3" />
          Apotek Digital Terpercaya
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Kesehatan Anda,{' '}
          <span className="text-primary">Prioritas Kami</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Pesan obat dengan mudah, konsultasi dengan apoteker profesional, dan
          pantau kesehatan keluarga Anda — semua dalam satu platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Mulai Sekarang — Gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Masuk ke Akun
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
