'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction } from '@/features/auth/actions'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { toast } from 'sonner'
import {
  Heart,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Clock,
  Pill,
  CheckCircle2,
} from 'lucide-react'

const brandFeatures = [
  { icon: Pill, label: 'Ribuan pilihan obat berkualitas' },
  { icon: Shield, label: 'Transaksi aman & terlindungi' },
  { icon: Clock, label: 'Layanan apoteker 24 jam' },
]

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await loginAction(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[500px] shrink-0 flex-col relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85">
        {/* decorative circles */}
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 -right-28 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-28 left-8 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">SehatKu</span>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center space-y-10 mt-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white/80 text-xs font-semibold">Apotek Digital Terpercaya</span>
              </div>
              <h2 className="text-4xl font-black text-white leading-tight">
                Kesehatan Anda,<br />
                <span className="text-white/60">Prioritas Kami.</span>
              </h2>
              <p className="text-white/55 text-sm leading-relaxed max-w-[280px]">
                Pesan obat dengan mudah, pantau riwayat kesehatan, dan konsultasi apoteker profesional — semua dalam satu platform.
              </p>
            </div>

            <div className="space-y-3">
              {brandFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/75 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-white/35 text-xs">© 2025 SehatKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Back link */}
        <div className="p-6 lg:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke beranda
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[380px] space-y-8">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Heart className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <div>
                <p className="font-black text-lg leading-none">SehatKu</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Apotek Digital Terpercaya</p>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Selamat datang kembali
              </h1>
              <p className="text-sm text-muted-foreground">
                Masukkan email dan password untuk melanjutkan
              </p>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="h-11 pr-10 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 font-bold shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  Belum punya akun?
                </span>
              </div>
            </div>

            {/* Register CTA */}
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 font-semibold border-border/60 hover:bg-muted/50"
              >
                Daftar sekarang — Gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
