import { getAllUsers } from '@/features/admin/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserRoleManager } from '@/features/admin/components/user-role-manager'

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground text-sm">Kelola peran dan informasi semua pengguna platform.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm leading-none">{user.full_name || 'Tanpa Nama'}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 font-mono">{user.phone || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase text-muted-foreground">{user.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'pharmacist' ? 'info' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-right">
                    <UserRoleManager userId={user.id} currentRole={user.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
