import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { processMidtransWebhook } from '@/features/payments/webhook'

/**
 * Midtrans Webhook Entry Point
 * Handles incoming notifications from Midtrans, verifies signatures,
 * and delegates processing to the payment service layer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key } = body

    // 1. Security: Verify Midtrans Signature
    // Signature Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const hashed = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (hashed !== signature_key) {
      console.warn(`[Webhook Security] Invalid Signature for Order: ${order_id}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // 2. Delegate Business Logic
    await processMidtransWebhook(body)

    return NextResponse.json({ status: 'ok' })
  } catch (err: any) {
    console.error('[Midtrans Webhook Route Error]:', err.message)
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    )
  }
}
