'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import type { AuthUser } from '@/types/database'

interface AuthStoreHydratorProps {
  user: AuthUser
}

export default function AuthStoreHydrator({ user }: AuthStoreHydratorProps) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return null
}
