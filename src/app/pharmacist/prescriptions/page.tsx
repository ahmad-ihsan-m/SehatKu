import { getAllPrescriptions } from '@/features/pharmacist/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrescriptionReviewPanel } from '@/features/pharmacist/components/prescription-review-panel'
import { DeletePrescriptionButton } from '@/features/pharmacist/components/delete-prescription-button'
import { requirePharmacist } from '@/lib/auth/guards'
import { Pill } from 'lucide-react'
import Image from 'next/image'

export default async function PharmacistPrescriptionsPage() {
  await requirePharmacist()
  const prescriptions = await getAllPrescriptions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daftar Validasi Resep</h1>
          <p className="text-muted-foreground text-sm">Verifikasi keaslian resep dokter yang diunggah pelanggan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="overflow-hidden border-none shadow-sm group">
            <div className="aspect-[4/5] relative bg-muted">
              {rx.signedImageUrl ? (
                <Image 
                  src={rx.signedImageUrl} 
                  alt="Resep" 
                  fill
                  className="object-cover transition-transform group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                  Gambar tidak tersedia atau akses ditolak
                </div>
              )}
              
              {/* Actions Overlay */}
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/50">
                  <DeletePrescriptionButton prescriptionId={rx.id} />
                </div>
              </div>

              <div className="absolute top-3 right-3 z-10">
                <Badge variant={rx.status === 'approved' ? 'success' : rx.status === 'rejected' ? 'destructive' : 'warning'} className="uppercase font-bold tracking-tight shadow-lg">
                  {rx.status}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {rx.id.slice(0, 8)}</p>
                  <h3 className="font-bold truncate text-sm mt-0.5">{rx.profiles?.full_name || 'Pelanggan'}</h3>
                  
                  {rx.medicines?.name && (
                    <div className="flex items-center gap-1.5 mt-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <Pill className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase truncate">
                        {rx.medicines.name}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium bg-muted/50 px-2 py-0.5 rounded-md ml-2">
                  {new Date(rx.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              
              <PrescriptionReviewPanel 
                prescriptionId={rx.id} 
                currentStatus={rx.status} 
                currentNotes={rx.pharmacist_notes} 
              />
            </CardContent>
          </Card>
        ))}

        {prescriptions.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-muted">
            <p className="text-muted-foreground font-medium">Belum ada resep yang perlu divalidasi.</p>
          </div>
        )}
      </div>
    </div>
  )
}
