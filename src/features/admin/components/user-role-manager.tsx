'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUserRoleAction } from '@/features/admin/actions'
import { toast } from 'sonner'
import type { UserRole } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface UserRoleManagerProps {
  userId: string
  currentRole: UserRole
}

export function UserRoleManager({ userId, currentRole }: UserRoleManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string>(currentRole)

  // Sync state with props
  useEffect(() => {
    setRole(currentRole)
  }, [currentRole])

  async function handleRoleChange(newRole: string) {
    setRole(newRole) // Optimistic
    setIsLoading(true)
    
    const result = await updateUserRoleAction(userId, newRole as UserRole)
    
    if (result.success) {
      toast.success('Peran pengguna berhasil diperbarui')
    } else {
      toast.error(result.error)
      setRole(currentRole) // Rollback
    }
    setIsLoading(false)
  }

  return (
    <div className="flex justify-end items-center gap-2">
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
      <Select value={role} onValueChange={handleRoleChange} disabled={isLoading}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Peran" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="pharmacist">Pharmacist</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
