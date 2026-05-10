import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getOrderById } from '@/features/orders/queries'
import OrderDetailClient from '@/features/orders/components/order-detail-client'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const user = await requireAuth()
  const order = await getOrderById(user.id, id)

  if (!order) {
    notFound()
  }

  return <OrderDetailClient order={order} />
}
