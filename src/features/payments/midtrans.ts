import midtransClient from 'midtrans-client'

// Initialize Midtrans Snap client
// Note: We use a getter to ensure env variables are loaded correctly in server context
export const getMidtransClient = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  const isProduction = 
    process.env.MIDTRANS_IS_PRODUCTION === 'true' || 
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

  if (!serverKey || !clientKey) {
    throw new Error('Midtrans API keys are not configured. Check your environment variables.')
  }

  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  })
}

export interface MidtransTransactionDetails {
  order_id: string
  gross_amount: number
}

export interface MidtransCustomerDetails {
  first_name: string
  email: string
  phone?: string
  shipping_address?: {
    first_name: string
    address: string
    city?: string
    postal_code?: string
  }
}

export interface MidtransItemDetails {
  id: string
  price: number
  quantity: number
  name: string
}

export interface MidtransCreateTransactionParams {
  transaction_details: MidtransTransactionDetails
  customer_details: MidtransCustomerDetails
  item_details: MidtransItemDetails[]
  expiry?: {
    start_time?: string
    unit: 'minutes' | 'hours' | 'days'
    duration: number
  }
}

/**
 * Creates a Midtrans Snap transaction and returns the snap token and redirect URL.
 */
export async function createMidtransTransaction(params: MidtransCreateTransactionParams) {
  const snap = getMidtransClient()

  try {
    const transaction = await snap.createTransaction(params)
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }
  } catch (error: any) {
    console.error('[Midtrans] Create Transaction Error:', error.message)
    throw new Error(`Gagal membuat transaksi pembayaran: ${error.message}`)
  }
}

/**
 * Verifies the transaction status from Midtrans API (Server-to-Server).
 */
export async function getMidtransTransactionStatus(orderId: string) {
  const snap = getMidtransClient()
  
  try {
    // We use snap.transaction.status() if available or general status check
    return await snap.transaction.status(orderId)
  } catch (error: any) {
    console.error('[Midtrans] Get Status Error:', error.message)
    return null
  }
}
