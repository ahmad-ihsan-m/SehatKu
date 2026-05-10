'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { loginAction } from '@/features/auth/actions'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { toast } from 'sonner'
import { Heart, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

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
    // On success: server redirects — isLoading stays true intentionally
  }

  return (
    <div
      className="
      min-h-[100dvh]
      bg-gradient-to-br
      from-primary/5
      via-background
      to-primary/10
      px-4
      py-10
    "
    >
      <div
        className="
        mx-auto
        flex
        min-h-[calc(100dvh-5rem)]
        w-full
        items-start
        justify-center
        sm:items-center
      "
      >
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="space-y-3 text-center">
            <div
              className="
              mx-auto
              inline-flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-primary
              text-primary-foreground
              shadow-lg
            "
            >
              <Heart className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">
                SehatKu
              </h1>

              <p className="text-sm text-muted-foreground">
                Apotek Digital Terpercaya
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="border border-border/60 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">
                Masuk ke Akun
              </CardTitle>

              <CardDescription className="text-sm leading-relaxed">
                Masukkan email dan password Anda untuk melanjutkan.
              </CardDescription>
            </CardHeader>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    aria-invalid={!!form.formState.errors.email}
                    {...form.register('email')}
                  />

                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    autoComplete="current-password"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register('password')}
                  />

                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sedang masuk...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Belum punya akun?{' '}
                  <Link
                    href="/register"
                    className="
                    font-semibold
                    text-primary
                    underline-offset-4
                    hover:underline
                  "
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
