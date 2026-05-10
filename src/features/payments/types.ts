export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

export interface PaymentMetadata {
  midtrans_response?: any
  error_message?: string
  retry_count?: number
}

export interface Payment {
  id: string
  order_id: string
  user_id: string
  amount: number
  status: PaymentStatus
  payment_method?: string
  transaction_id?: string
  snap_token?: string
  snap_redirect_url?: string
  fraud_status?: string
  paid_at?: string
  expired_at?: string
  created_at: string
  metadata: PaymentMetadata
}

export interface WebhookPayload {
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  payment_type: string
  order_id: string
  merchant_id: string
  gross_amount: string
  fraud_status?: string
  currency: string
  settlement_time?: string
  expiry_time?: string
}
