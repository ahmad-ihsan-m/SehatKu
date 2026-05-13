declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  interface TransactionResult {
    token: string
    redirect_url: string
  }

  class Snap {
    constructor(options: SnapOptions)
    createTransaction(params: object): Promise<TransactionResult>
    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>
    }
  }

  const midtransClient: { Snap: typeof Snap }
  export default midtransClient
}
