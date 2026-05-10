export type UserRole = 'customer' | 'admin' | 'pharmacist'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PrescriptionStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Medicine {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  stock: number
  requires_prescription: boolean
  image_url: string | null
  dosage: string | null
  manufacturer: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MedicineWithCategory extends Medicine {
  categories: Category | null
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  medicine_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface CartItemWithMedicine extends CartItem {
  medicines: Pick<Medicine, 'id' | 'name' | 'price' | 'stock' | 'requires_prescription' | 'image_url'>
}

export interface CartWithItems extends Cart {
  cart_items: CartItemWithMedicine[]
}

export interface Prescription {
  id: string
  user_id: string
  medicine_id: string | null
  image_url: string
  status: PrescriptionStatus
  pharmacist_notes: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  prescription_id: string | null
  status: OrderStatus
  total_amount: number
  shipping_address: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  medicine_id: string | null
  quantity: number
  price_at_time: number
  created_at: string
  updated_at: string
}

export interface OrderWithItems extends Order {
  order_items: Array<
    OrderItem & {
      medicines: Pick<Medicine, 'id' | 'name' | 'image_url'> | null
    }
  >
}

export interface Payment {
  id: string
  order_id: string
  status: PaymentStatus
  payment_method: string | null
  amount: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AuthUser {
  id: string
  email: string | undefined
  profile: Profile
}

export type ActionResult<T = void> =
  | { success: true; data?: T; error?: never }
  | { success?: never; error: string }
