import { getAllOrders } from '@/features/admin/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { OrderStatusManager } from '@/features/admin/components/order-status-manager'

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pesanan</h1>
          <p className="text-muted-foreground text-sm">Lihat dan perbarui status semua pesanan pelanggan.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Order ID</TableHead>
                <TableHead className="font-bold">Pelanggan</TableHead>
                <TableHead className="font-bold">Total</TableHead>
                <TableHead className="font-bold">Payment</TableHead>
                <TableHead className="font-bold">Status Pesanan</TableHead>
                <TableHead className="font-bold">Tanggal</TableHead>
                <TableHead className="text-right font-bold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-[10px] uppercase font-bold text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{(order as any).profiles?.full_name || 'Anonim'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'failed' || order.payment_status === 'expired' ? 'destructive' : 'warning'}
                        className="w-fit text-[10px] uppercase px-2 py-0"
                      >
                        {order.payment_status || 'Pending'}
                      </Badge>
                      {order.payments?.transaction_id && (
                        <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[100px]">
                          TX: {order.payments.transaction_id.slice(0, 12)}...
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'delivered' ? 'success' : 
                      order.status === 'cancelled' ? 'destructive' : 
                      order.status === 'pending' ? 'warning' : 'info'
                    } className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderStatusManager orderId={order.id} currentStatus={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
