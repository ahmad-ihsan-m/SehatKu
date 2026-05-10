import { redirect } from 'next/navigation'
import { requireCustomer } from '@/lib/auth/guards'
import { getCartItems } from '@/features/cart/queries'
import { getApprovedPrescription } from '@/features/prescriptions/queries'
import CheckoutClient from '@/features/checkout/components/checkout-client'

export default async function CheckoutPage() {
  const user = await requireCustomer()
  const [items, approvedPrescription] = await Promise.all([
    getCartItems(user.id),
    getApprovedPrescription(user.id)
  ])

  // Redirect to cart if empty
  if (items.length === 0) {
    redirect('/cart')
  }

  return <CheckoutClient items={items} approvedPrescription={approvedPrescription} />
}

