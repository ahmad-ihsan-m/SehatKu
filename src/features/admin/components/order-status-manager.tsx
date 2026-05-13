'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrderStatusAction } from '@/features/admin/actions'
import { toast } from 'sonner'
import type { OrderStatus } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface OrderStatusManagerProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusManager({ orderId, currentStatus }: OrderStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>(currentStatus)

  // Keep local state in sync with props
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus) // Optimistic UI update
    setIsLoading(true)
    
    const result = await updateOrderStatusAction(orderId, newStatus as OrderStatus)
    
    if (result.success) {
      toast.success('Status pesanan berhasil diperbarui')
    } else {
      toast.error(result.error)
      setStatus(currentStatus) // Rollback on error
    }
    setIsLoading(false)
  }

  return (
    <div className="flex justify-end items-center gap-2">
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
      <Select value={status} onValueChange={(v) => { if (v) void handleStatusChange(v) }} disabled={isLoading}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Menunggu</SelectItem>
          <SelectItem value="processing">Diproses</SelectItem>
          <SelectItem value="shipped">Dikirim</SelectItem>
          <SelectItem value="delivered">Selesai</SelectItem>
          <SelectItem value="cancelled">Dibatalkan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
