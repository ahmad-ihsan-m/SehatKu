'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerAction } from '@/features/auth/actions'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas'
import { toast } from 'sonner'
import {
  Heart,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Star,
  Users,
  PackageCheck,
  Stethoscope,
} from 'lucide-react'

const stats = [
  { icon: Users, value: '10.000+', label: 'Pengguna aktif' },
  { icon: PackageCheck, value: '5.000+', label: 'Obat tersedia' },
  { icon: Stethoscope, value: '50+', label: 'Apoteker terverifikasi' },
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await registerAction(formData)

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
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -left-28 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

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
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="text-white/80 text-xs font-semibold">Bergabung gratis sekarang</span>
              </div>
              <h2 className="text-4xl font-black text-white leading-tight">
                Mulai perjalanan<br />
                <span className="text-white/60">sehat Anda.</span>
              </h2>
              <p className="text-white/55 text-sm leading-relaxed max-w-[280px]">
                Buat akun dalam 30 detik dan nikmati kemudahan membeli obat, upload resep, serta notifikasi stok real-time.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-white/10 border border-white/10"
                >
                  <Icon className="w-4 h-4 text-white/70 mb-2" />
                  <p className="text-white font-black text-base leading-none">{value}</p>
                  <p className="text-white/50 text-[10px] font-medium mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="p-4 rounded-xl bg-white/10 border border-white/10 space-y-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                ))}
              </div>
              <p className="text-white/70 text-xs leading-relaxed italic">
                "SehatKu memudahkan saya mendapatkan obat tanpa antri panjang. Pelayanannya cepat dan terpercaya!"
              </p>
              <p className="text-white/40 text-[10px] font-semibold">— Budi S., Jakarta</p>
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
                Buat akun baru
              </h1>
              <p className="text-sm text-muted-foreground">
                Daftar gratis dan mulai pesan obat dengan mudah
              </p>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Budi Santoso"
                  autoComplete="name"
                  className="h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                  aria-invalid={!!form.formState.errors.fullName}
                  {...form.register('fullName')}
                />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

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
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
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
                    Mendaftarkan akun...
                  </>
                ) : (
                  'Buat Akun Gratis'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Dengan mendaftar, Anda menyetujui{' '}
                <span className="text-primary font-medium cursor-pointer hover:underline underline-offset-2">
                  Syarat & Ketentuan
                </span>{' '}
                kami.
              </p>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  Sudah punya akun?
                </span>
              </div>
            </div>

            {/* Login link */}
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 font-semibold border-border/60 hover:bg-muted/50"
              >
                Masuk ke akun saya
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
