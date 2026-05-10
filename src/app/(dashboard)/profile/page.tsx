import { requireAuth } from '@/lib/supabase/auth-helpers'
import { User, Shield, Phone, Mail, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProfileForm } from '@/features/profile/components/profile-form'

export default async function ProfilePage() {
  const user = await requireAuth()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Pengaturan Profil
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola informasi pribadi dan preferensi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8 pt-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background overflow-hidden">
                  {user.profile.avatar_url ? (
                    <img src={user.profile.avatar_url} alt={user.profile.full_name || ''} className="w-full h-full object-cover" />
                  ) : (
                    user.profile.full_name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h2 className="font-bold text-lg">{user.profile.full_name || 'Pengguna'}</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mt-1">
                  <Shield className="w-3 h-3" />
                  {user.profile.role}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Email</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Telepon</p>
                  <p className="font-medium">{user.profile.phone || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Personal</CardTitle>
              <CardDescription>Perbarui data diri Anda untuk mempermudah proses pesanan.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
